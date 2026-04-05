export type ExampleTask = {
  id: string;
  label: string;
  task: string;
};

export const EXAMPLE_TASKS: ExampleTask[] = [
  {
    id: 'amazon-search',
    label: 'Amazon product search',
    task:
      'Go to amazon.com, search for "wireless noise cancelling headphones", sort by price low to high, and report the name, price, and rating of the first result.',
  },
  {
    id: 'wiki-compare',
    label: 'Wikipedia deep lookup',
    task:
      "Go to wikipedia.org, search for 'Python programming language', open the article, scroll to the 'History' section, and tell me who created Python and in what year.",
  },
  {
    id: 'hn-story',
    label: 'Hacker News deep dive',
    task:
      'Go to news.ycombinator.com, click on the top story on the front page, then extract the title, the URL it links to, and the top 3 comments.',
  },
  {
    id: 'github-repo',
    label: 'GitHub repo stats',
    task:
      'Go to github.com, search for "fastapi", open the first repository result, and report its star count, latest release version, and the description.',
  },
  {
    id: 'recipe-details',
    label: 'Recipe ingredients',
    task:
      'Go to allrecipes.com, search for "chocolate chip cookies", open the first result, and list all the ingredients and the total prep time.',
  },
];
