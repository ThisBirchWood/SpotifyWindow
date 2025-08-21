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
        setMostListenedSongs(getListenedTracks(streams, dateToTs(dateRange[0]), dateToTs(dateRange[1]), 100));
        setMostListenedArtists(getListenedArtists(streams, dateToTs(dateRange[0]), dateToTs(dateRange[1]), 100));
    }, [dateRange]);

    if (streams.length === 0 || !firstStreamDate || !lastStreamDate) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="flex flex-row justify-between items-start gap-4 p-4">

                <div className="w-150 h-180 overflow-auto">
                    <h1>Track Statistics</h1>
                    <ul className="truncate">
                        {mostListenedSongs.map((track, index) => (
                            <li key={index} className="w-full h-6 overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
                                {track.master_metadata_track_name} - {formatSeconds(track.ms_played/1000)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-150 h-180 overflow-auto"> 
                    <h1>Artist Statistics</h1>
                    <ul className="truncate">
                        {mostListenedArtists.map((artist, index) => (
                            <li key={index} className="w-full h-6 overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
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
                {dateRange[0].toUTCString()} - {dateRange[1].toUTCString()} ({getDaysBetween(dateRange[0], dateRange[1])} days)
            </p>
        </div>
    )
}

export default StatView;