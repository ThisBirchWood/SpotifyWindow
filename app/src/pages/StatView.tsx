import { useEffect, useState } from 'react';
import { getAllStreams } from '../util/db';
import { formatSeconds, tsToDate, getDaysBetween, getDaysAfter, dateToTs } from '../util/time';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css'; 
import type { stream } from '../model/types';
import { getFirstStreamDate, getLastStreamDate, getListenedTracks, getListenedArtists } from '../model/parser';

const StatView = () => {
    const [streams, setStreams] = useState<stream[]>([]);
    const [mostListenedSongs, setMostListenedSongs] = useState<stream[]>([]);
    const [mostListenedArtists, setMostListenedArtists] = useState<stream[]>([]);

    const [firstStreamDate, setFirstStreamDate] = useState<Date>();
    const [lastStreamDate, setLastStreamDate] = useState<Date>();

    const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);

    useEffect(() => {
        getAllStreams().then((streams) => {
            setStreams(streams);
            if (streams.length > 0) {
                const firstDate = tsToDate(getFirstStreamDate(streams));
                const lastDate = tsToDate(getLastStreamDate(streams));
                setFirstStreamDate(firstDate);
                setLastStreamDate(lastDate);
                setDateRange([firstDate, lastDate]);
            }
        }).catch((error) => {
            console.error('Error fetching streams:', error);
        });
    }, []);

    useEffect(() => {
        setMostListenedSongs(getListenedTracks(streams, dateToTs(dateRange[0]), dateToTs(dateRange[1]), 20));
        setMostListenedArtists(getListenedArtists(streams, dateToTs(dateRange[0]), dateToTs(dateRange[1]), 20));
    }, [dateRange]);

    if (streams.length === 0 || !firstStreamDate || !lastStreamDate) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full">
            <div className="w-full flex flex-row items-center">
                <div className="w-full">
                    <h1>Track Statistics</h1>
                    <ul>
                        {mostListenedSongs.map((track, index) => (
                            <li key={index}>
                                {track.master_metadata_track_name} - {formatSeconds(track.ms_played/1000)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full ml-4"> 
                    <h1>Artist Statistics</h1>
                    <ul>
                        {mostListenedArtists.map((artist, index) => (
                            <li key={index}>
                                {artist.master_metadata_album_artist_name} - {formatSeconds(artist.ms_played/1000)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <RangeSlider
                min={0}
                max={getDaysBetween(firstStreamDate, lastStreamDate)}
                step={1}
                onInput={(value) => {
                    const startDate = getDaysAfter(firstStreamDate, value[0]);
                    const endDate = getDaysAfter(firstStreamDate, value[1]);
                    setDateRange([startDate, endDate]);
                }}
                className="w-full"
            />

            <p className="text-center">
                {dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()}
            </p>
        </div>
    )
}

export default StatView;