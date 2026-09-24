/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

type LazyVideoCardProps = {
  name: string;
  src?: string;
  poster?: string;
};

export function LazyVideoCard({ name, src, poster }: LazyVideoCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <article className="video-card">
      <div className="video-frame">
        {isActive && src ? (
          <video
            className="testimonial-video"
            controls
            playsInline
            autoPlay
            preload="none"
            poster={poster}
            onError={() => setHasError(true)}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : src || poster ? (
          <button
            type="button"
            className="video-trigger has-poster"
            onClick={() => setIsActive(true)}
            aria-label={`Play ${name} testimonial`}
          >
            {poster ? <img src={poster} alt="" loading="lazy" decoding="async" /> : null}
            <span className="play-icon" aria-hidden="true" />
          </button>
        ) : (
          <div className="video-placeholder" role="img" aria-label={`${name} video testimonial placeholder`}>
            <span className="play-icon" aria-hidden="true" />
          </div>
        )}
        {hasError ? (
          <p className="media-error" role="alert">
            This testimonial is temporarily unavailable.
          </p>
        ) : null}
      </div>
      <div className="video-copy">
        <strong>{name}</strong>
        <span>Video testimonial</span>
      </div>
    </article>
  );
}
