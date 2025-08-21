import type { stream } from './types.ts';

const readFiles = async (files: File[]): Promise<stream[]> => {
    const streams: stream[] = [];

    for (const file of files) {
        const fileUrl = URL.createObjectURL(file);
        try {
            const response = await fetch(fileUrl);
            const data = await response.json();
            streams.push(...data);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }

    return streams;
}

const getListenedTracks = (streams: stream[], startDate: string, endDate: string, limit: number = 100): stream[] => {
    const trackMap: Record<string, stream> = {};

    streams.forEach(stream => {
        if (stream.ts < startDate || stream.ts > endDate || !stream.spotify_track_uri) {
            return; // Skip streams outside the date range
        }

        if (!trackMap[stream.spotify_track_uri]) {
            trackMap[stream.spotify_track_uri] = { ...stream, ms_played: 0 };
        }
        trackMap[stream.spotify_track_uri].ms_played += stream.ms_played;
    });

    const sortedTracks = Object.values(trackMap).sort((a, b) => b.ms_played - a.ms_played);
    return sortedTracks.slice(0, limit);
}

const getListenedArtists = (streams: stream[], startDate: string, endDate: string, limit: number = 100): stream[] => {
    const artistMap: Record<string, stream> = {};

    streams.forEach(stream => {
        if (stream.ts < startDate || stream.ts > endDate || !stream.master_metadata_album_artist_name) {
            return; // Skip streams outside the date range
        }

        if (!artistMap[stream.master_metadata_album_artist_name]) {
            artistMap[stream.master_metadata_album_artist_name] = { ...stream, ms_played: 0 };
        }
        artistMap[stream.master_metadata_album_artist_name].ms_played += stream.ms_played;
    });

    const sortedArtists = Object.values(artistMap).sort((a, b) => b.ms_played - a.ms_played);
    return sortedArtists.slice(0, limit);
}


const getFirstStreamDate = (streams: stream[]): string => {
    if (streams.length === 0) return '';
    return streams.reduce((earliest, stream) => {
        return stream.ts < earliest ? stream.ts : earliest;
    }, streams[0].ts);
}

const getLastStreamDate = (streams: stream[]): string => {
    if (streams.length === 0) return '';
    return streams.reduce((latest, stream) => {
        return stream.ts > latest ? stream.ts : latest;
    }, streams[0].ts);
}

export {
    readFiles,
    getListenedTracks,
    getListenedArtists,
    getFirstStreamDate,
    getLastStreamDate
}