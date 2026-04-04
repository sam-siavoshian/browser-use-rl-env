import { useScreenSize } from '@/hooks/use-screen-size';
import { PixelTrail } from '@/components/ui/pixel-trail';
import { GooeyFilter } from '@/components/ui/gooey-filter';

export function PixelBackground() {
  const screenSize = useScreenSize();

  return (
    <>
      <GooeyFilter id="gooey-bg" strength={4} />
      <div
        className="fixed inset-0 z-[1]"
        style={{ filter: 'url(#gooey-bg)' }}
      >
        <PixelTrail
          pixelSize={screenSize.lessThan('md') ? 28 : 36}
          fadeDuration={800}
          delay={100}
          pixelClassName="bg-lime/[0.07]"
        />
      </div>
    </>
  );
}
