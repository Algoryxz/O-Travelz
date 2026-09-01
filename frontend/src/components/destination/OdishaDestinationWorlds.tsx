/**
 * Cinematic Odisha Destination Worlds Portal for O-Travelz.
 * Delivers layered depth, slow parallax, atmospheric lighting, and unique authentic Odisha destinations.
 */
import React from 'react';
import { DESTINATION_WORLD_ASSETS, type DestinationWorldAsset } from '../../data/destinationWorldAssets';
import { DestinationWorldStage } from './DestinationWorldStage';

export { DESTINATION_WORLD_ASSETS as ODISHA_DESTINATION_WORLDS, type DestinationWorldAsset as DestinationWorld };

interface OdishaDestinationWorldsProps {
  onExplorePlace?: (placeId: string, name: string) => void;
  onExploreDestination?: (placeId: string, name: string) => void;
  onPlanTrip?: (placeName: string) => void;
  className?: string;
}

export const OdishaDestinationWorlds: React.FC<OdishaDestinationWorldsProps> = (props) => {
  return <DestinationWorldStage {...props} />;
};
