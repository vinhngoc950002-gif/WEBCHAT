export function normalizeAvatarGender(value){return value==='female'?'female':'male';}
export function accountAvatarGender(metadata){return normalizeAvatarGender(metadata?.avatar_gender);}
