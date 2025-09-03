import React, { useEffect } from 'react';
import { useUXCam } from '../hooks/useUXCam';

interface UXCamWrapperProps {
  children: React.ReactNode;
  screenName: string;
  trackScreenView?: boolean;
  markAsSensitive?: boolean;
  additionalProperties?: Record<string, any>;
}

/**
 * UXCam Wrapper Component
 * Automatically tracks screen views and provides UXCam functionality
 */
export const UXCamWrapper: React.FC<UXCamWrapperProps> = ({
  children,
  screenName,
  trackScreenView = true,
  markAsSensitive = false,
  additionalProperties = {},
}) => {
  const { trackScreenView: trackScreen, markSensitive, unmarkSensitive } = useUXCam();

  useEffect(() => {
    // Track screen view
    if (trackScreenView) {
      trackScreen(screenName, additionalProperties);
    }

    // Mark as sensitive if needed
    if (markAsSensitive) {
      markSensitive();
    }

    // Cleanup function
    return () => {
      if (markAsSensitive) {
        unmarkSensitive();
      }
    };
  }, [screenName, trackScreenView, markAsSensitive, additionalProperties]);

  return <>{children}</>;
};

/**
 * Higher Order Component for UXCam integration
 */
export const withUXCam = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string,
  options: {
    trackScreenView?: boolean;
    markAsSensitive?: boolean;
    additionalProperties?: Record<string, any>;
  } = {}
) => {
  const { trackScreenView = true, markAsSensitive = false, additionalProperties = {} } = options;

  const WithUXCamComponent: React.FC<P> = (props) => {
    return (
      <UXCamWrapper
        screenName={screenName}
        trackScreenView={trackScreenView}
        markAsSensitive={markAsSensitive}
        additionalProperties={additionalProperties}
      >
        <WrappedComponent {...props} />
      </UXCamWrapper>
    );
  };

  WithUXCamComponent.displayName = `withUXCam(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithUXCamComponent;
};
