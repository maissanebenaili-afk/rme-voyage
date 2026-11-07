import { EPISODES_AUDIO, SERIES_AUDIO, type EpisodeAudio, type SerieAudio } from './catalogue.generated';

export type { EpisodeAudio, SerieAudio };

export const episodesDe = (serie: string): EpisodeAudio[] => EPISODES_AUDIO.filter((e) => e.serie === serie).sort((a, b) => a.numero - b.numero);

export const seriesDisponibles = (): SerieAudio[] => SERIES_AUDIO.filter((s) => episodesDe(s.id).length > 0);
