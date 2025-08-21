type stream = {
    ts: string,
    spotify_track_uri: string,
    master_metadata_track_name: string,
    master_metadata_album_artist_name: string,
    master_metadata_album_album_name: string,
    ms_played: number,
    shuffle: boolean,
    skipped: boolean,

    platform: string,
    reason_start: string,
    reason_end: string,

    conn_country: string,
    ip_addr: string
}

export type { 
    stream 
}