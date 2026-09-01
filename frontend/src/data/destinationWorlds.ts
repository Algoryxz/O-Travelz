/**
 * Destination Worlds data queries and filter helpers.
 */
import { DESTINATION_WORLD_ASSETS, type DestinationWorldAsset } from './destinationWorldAssets';

export function getAllDestinationWorlds(): DestinationWorldAsset[] {
  return DESTINATION_WORLD_ASSETS;
}

export function getDestinationWorldById(id: string): DestinationWorldAsset | undefined {
  return DESTINATION_WORLD_ASSETS.find((w) => w.id === id);
}

export function getDestinationWorldsByCategory(
  category: 'ALL' | DestinationWorldAsset['category']
): DestinationWorldAsset[] {
  if (category === 'ALL') {
    return DESTINATION_WORLD_ASSETS;
  }
  return DESTINATION_WORLD_ASSETS.filter((w) => w.category === category);
}
