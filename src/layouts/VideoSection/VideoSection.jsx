import { useRef, useState } from "react";
import { FiCheck, FiPause, FiPlay, FiShield, FiVolume2, FiVolumeX } from "react-icons/fi";
import posterImage from "../../assets/premium/webp/hero-premium-v3-branded.webp";
import "../../styles/Home/VideoSection.css";
import "../../styles/Home/VideoSectionSpacing.css";

const journey = [
  { number: "01", title: "Choose your service", text: "Select the home service you need in just a few taps." },
  { number: "02", title: "Expert arrives", text: "A background-verified professional visits at your chosen time." },
  { number: "03", title: "Relax, it’s handled", text: "Track the work, pay securely and enjoy dependable after-service care." },
];

const VideoSection = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section className="video-section" aria-labelledby="how-it-works-title">
      <div className="video-section__glow" aria-hidden="true" />
      <div className="video-section__container">
        <div className="video-heading" data-reveal="up">
          <span className="video-heading__eyebrow"><FiPlay aria-hidden="true" /> The LocalPintu experience</span>
          <h2 id="how-it-works-title">See how effortless <em>home care</em> can be</h2>
          <p>From booking to a beautifully finished job, watch how LocalPintu brings trusted professionals right to your doorstep.</p>
        </div>

        <div className="video-story">
          <div className="video-story__steps" data-reveal="left">
            <span className="video-story__label">Your service journey</span>
            <div className="video-story__timeline">
              {journey.map((step) => (
                <article className="video-story__step" key={step.number}>
                  <span className="video-story__number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                </article>
              ))}
            </div>
            <div className="video-story__promise">
              <FiShield aria-hidden="true" />
              <div><strong>LocalPintu Promise</strong><span><FiCheck aria-hidden="true" /> Verified experts &amp; transparent pricing</span></div>
            </div>
          </div>

          <div className="video-wrapper" data-reveal="zoom">
            <video
              ref={videoRef}
              src="/media/localpintu-how-it-works.mp4"
              poster={posterImage}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              aria-label="LocalPintu home service experience"
            />
            <div className="video-wrapper__shade" aria-hidden="true" />
            <div className="video-wrapper__topline"><span><i /> Live service story</span><span>15 sec</span></div>
            <div className="video-wrapper__caption"><span>Care for every corner</span><strong>Skilled hands. Happier homes.</strong></div>
            <div className="video-controls">
              <button type="button" onClick={togglePlayback} aria-label={isPlaying ? "Pause video" : "Play video"}>{isPlaying ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}</button>
              <button type="button" onClick={toggleMute} aria-label={isMuted ? "Unmute video" : "Mute video"}>{isMuted ? <FiVolumeX aria-hidden="true" /> : <FiVolume2 aria-hidden="true" />}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
