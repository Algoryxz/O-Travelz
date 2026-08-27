import re

code = open('frontend/src/utils/imageService.ts', encoding='utf-8').read()
keys = re.findall(r'"(place_[a-zA-Z0-9_]+)":', code)
print('Found place keys in imageService.ts:', len(keys), keys[:20])

manifest_matches = re.findall(r'export const ([A-Z_]+_MANIFEST)', code)
print('Manifests:', manifest_matches)
