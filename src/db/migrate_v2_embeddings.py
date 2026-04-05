"""Migration: upgrade embeddings from text-embedding-3-small (1536d) to text-embedding-3-large (3072d).

This script:
1. Backs up task_templates to task_templates_backup
2. Drops the old IVF-flat index
3. ALTERs the embedding column from vector(1536) to vector(3072)
4. Re-embeds ALL existing templates using rich composite text + new model
5. Verifies the migration

Usage:
    python -m src.db.migrate_v2_embeddings
"""

import asyncio
import json
import os
import sys

import asyncpg
from dotenv import load_dotenv

from .embeddings import (
    EMBEDDING_DIMS,
    build_embedding_text,
    generate_embeddings_batch,
)


async def migrate() -> None:
    """Run the full embedding migration."""
    load_dotenv()

    db_url = os.environ.get("SUPABASE_DB_URL")
    if not db_url:
        print("ERROR: SUPABASE_DB_URL not set")
        sys.exit(1)

    print("Connecting to database...")
    conn = await asyncpg.connect(db_url)

    try:
        # Step 1: Backup
        print("Step 1/5: Backing up task_templates...")
        await conn.execute("DROP TABLE IF EXISTS task_templates_backup")
        await conn.execute(
            "CREATE TABLE task_templates_backup AS SELECT * FROM task_templates"
        )
        backup_count = await conn.fetchval(
            "SELECT COUNT(*) FROM task_templates_backup"
        )
        print(f"  Backed up {backup_count} rows")

        # Step 2: Drop old index
        print("Step 2/5: Dropping old IVF-flat index...")
        await conn.execute("DROP INDEX IF EXISTS idx_templates_embedding")
        print("  Done")

        # Step 3: Alter column dimension
        print(f"Step 3/5: Altering embedding column to vector({EMBEDDING_DIMS})...")
        await conn.execute(
            f"ALTER TABLE task_templates ALTER COLUMN embedding TYPE vector({EMBEDDING_DIMS})"
        )
        print("  Done")

        # Step 4: Re-embed all templates
        print("Step 4/5: Re-embedding templates with rich text + new model...")
        rows = await conn.fetch(
            "SELECT id, task_pattern, steps, parameters, domain, action_type "
            "FROM task_templates"
        )

        if not rows:
            print("  No templates to re-embed")
        else:
            texts = []
            for row in rows:
                # Fetch site knowledge for domain context
                site_row = await conn.fetchrow(
                    "SELECT selector_map FROM site_knowledge WHERE domain = $1",
                    row["domain"],
                )
                site_knowledge = None
                if site_row and site_row["selector_map"]:
                    sk = site_row["selector_map"]
                    site_knowledge = {
                        "selector_map": json.loads(sk) if isinstance(sk, str) else sk
                    }

                steps = row["steps"]
                if isinstance(steps, str):
                    steps = json.loads(steps)
                parameters = row["parameters"]
                if isinstance(parameters, str):
                    parameters = json.loads(parameters)

                rich_text = build_embedding_text(
                    task_pattern=row["task_pattern"],
                    steps=steps,
                    parameters=parameters,
                    domain=row["domain"],
                    action_type=row["action_type"],
                    site_knowledge=site_knowledge,
                )
                texts.append(rich_text)
                print(f"  Built text for: {row['task_pattern'][:60]}")

            # Batch embed
            print(f"  Generating {len(texts)} embeddings with text-embedding-3-large...")
            embeddings = generate_embeddings_batch(texts)

            # Update each row
            for row, emb in zip(rows, embeddings):
                emb_str = f"[{','.join(str(x) for x in emb)}]"
                await conn.execute(
                    "UPDATE task_templates SET embedding = $2::vector WHERE id = $1",
                    row["id"],
                    emb_str,
                )
            print(f"  Re-embedded {len(rows)} templates")

        # Step 5: Verify
        print("Step 5/5: Verifying...")
        count = await conn.fetchval("SELECT COUNT(*) FROM task_templates")
        dim_check = await conn.fetchrow(
            "SELECT vector_dims(embedding) AS dims FROM task_templates LIMIT 1"
        )
        if dim_check:
            print(f"  Templates: {count}, embedding dims: {dim_check['dims']}")
            if dim_check["dims"] != EMBEDDING_DIMS:
                print(f"  WARNING: Expected {EMBEDDING_DIMS} dims, got {dim_check['dims']}")
        else:
            print(f"  Templates: {count} (no rows to verify dims)")

        print("\nMigration complete.")
        print("  Backup table: task_templates_backup (drop when satisfied)")

    finally:
        await conn.close()


def main() -> None:
    """Entry point for python -m src.db.migrate_v2_embeddings."""
    asyncio.run(migrate())


if __name__ == "__main__":
    main()
