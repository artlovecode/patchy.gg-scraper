export enum Region {
  NA = 'NA',
  EU = 'EU',
  KR = 'KR',
  CN = 'CN',
  LMS = 'LMS',
  BR = 'BR',
  CIS = 'CIS',
  JP = 'JP',
  LAT = 'LAT',
  OCE = 'OCE',
  SEA = 'SEA',
  TR = 'TR',
  VN = 'VN',
  NONE = 'NONE'
}
export type Player = {
  ingameName: string;
  playerName: string;
  residencyRegion: Region;
  currentActiveRegion: Region;
  link: string;
  soloQIds: string[];
};

export type Team = {
  name: string;
  region: Region;
  link?: string;
  currentActiveRoster: string[];
};
