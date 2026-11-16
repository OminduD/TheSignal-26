import { useState, useCallback, Suspense, useEffect } from "react";
import { useSonarAudio } from "./hooks/useSonarAudio";
import { useDiveScroll } from "./hooks/useDiveScroll";
import { OceanWorld3D } from "./components/OceanWorld3D";
import { Navbar } from "./components/Navbar";
import { LandingHero } from "./components/LandingHero";
import { StorySections } from "./components/StorySections";
import { DepthMeter } from "./components/DepthMeter";
import { AudioToggle } from "./components/AudioToggle";
import { CreditsFooter } from "./components/CreditsFooter";
import { RegistrationModal } from "./components/RegistrationModal";
import { LoadingScreen } from "./components/LoadingScreen";

export function App() {
  const { isMuted, toggleAudio, updateDepth } = useSonarAudio();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollContainerRef, diveRef, lenisRef } = useDiveScroll({
    onDepthUpdate: (depth) => updateDepth(depth),
  });

  // Lock Lenis smooth scroll until loading completes
  useEffect(() => {
    if (isLoading) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [isLoading, lenisRef]);

  const scrollToPercent = useCallback(
    (percent: number) => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetY = maxScroll * (percent / 100);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetY, { duration: 1.5 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
    [lenisRef],
  );

  return (
    <>
      {/* 0. Central Circular Telemetry Loading Screen (fills with site & 3D asset progress) */}
      <LoadingScreen onComplete={() => setIsLoading(false)} />

      <main
        ref={scrollContainerRef}
        className="relative w-full h-[450vh] bg-[#010204] text-white"
      >
        {/* 1. Fixed Transparent Top Navbar (Wordmark on Left, Nav Links on Right) */}
        <Navbar onScrollTo={scrollToPercent} />

        {/* 2. Permanently Viewport-Locked 100dvh 3D Stage - Submarine, Seabed & 3D Branding */}
        <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden pointer-events-none">
          <Suspense fallback={null}>
            <OceanWorld3D diveRef={diveRef} />
          </Suspense>
        </div>

        {/* 3. Landing Hero Overlay (0% – 18% Scroll) */}
        <LandingHero diveRef={diveRef} onScrollTo={scrollToPercent} />

        {/* 4. Left-Aligned Scrollytelling Hackathon Sections */}
        <StorySections
          diveRef={diveRef}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* 5. Live Ocean Depth Telemetry Meter (Right Edge) */}
        <DepthMeter diveRef={diveRef} />

        {/* 6. Hydrophone Sonar Audio Toggle (Relocated to Bottom-Right Corner) */}
        <AudioToggle isMuted={isMuted} onToggle={toggleAudio} />

        {/* 7. Site & 3D Asset Attribution Credits (Reveals at bottom) */}
        <CreditsFooter diveRef={diveRef} />

        {/* 8. Registration Modal */}
        <RegistrationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
        />
      </main>
    </>
  );
}

export default App;
