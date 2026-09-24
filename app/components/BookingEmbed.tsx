'use client';

import { useEffect, useState } from 'react';
import { mergeParamsIntoCalLink } from '../lib/attribution';

const CAL_LINK = 'forms/448625c4-3579-4b51-ab5d-b35b88a840ad';
type CalComponent = typeof import('@calcom/embed-react').default;

type BookingEmbedProps = {
  trackingParams: URLSearchParams;
};

export function BookingEmbed({ trackingParams }: BookingEmbedProps) {
  const [CalEmbed, setCalEmbed] = useState<CalComponent | null>(null);

  useEffect(() => {
    let isActive = true;

    void import('@calcom/embed-react')
      .then(async ({ default: Cal, getCalApi }) => {
        if (!isActive) return;

        setCalEmbed(() => Cal);

        const cal = await getCalApi({});
        if (!isActive) return;

        cal('ui', {
          theme: 'dark',
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
      })
      .catch((error: unknown) => {
        console.error('Cal.com embed failed to initialize.', error);
      });

    return () => {
      isActive = false;
    };
  }, [trackingParams]);

  const calLink = mergeParamsIntoCalLink(CAL_LINK, trackingParams);

  return (
    <div className="booking-shell" aria-label="Cal.com booking form">
      {CalEmbed ? (
        <CalEmbed
          key={calLink}
          calLink={calLink}
          style={{ width: '100%' }}
          config={{
            layout: 'month_view',
            useSlotsViewOnSmallScreen: 'true',
            theme: 'dark',
          }}
        />
      ) : null}
    </div>
  );
}
