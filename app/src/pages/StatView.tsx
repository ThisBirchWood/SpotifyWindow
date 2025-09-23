import { useEffect, useState } from "react";
import { getAllStreams } from "../util/db";
import { formatSeconds, tsToDate, getDaysBetween, getDaysAfter, dateToTs } from "../util/time";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import type { stream } from "../model/types";
import { getFirstStreamDate, getLastStreamDate, getListenedTracks, getListenedArtists } from "../model/parser";
import { useNavigate } from "react-router-dom";
import { ArrowLeft as Back } from "lucide-react";

const StatView = () => {
	const [streams, setStreams] = useState<stream[]>([]);
	const [mostListenedSongs, setMostListenedSongs] = useState<stream[]>([]);
	const [mostListenedArtists, setMostListenedArtists] = useState<stream[]>([]);

	const [firstStreamDate, setFirstStreamDate] = useState<Date>();
	const [lastStreamDate, setLastStreamDate] = useState<Date>();

	const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
	const navigate = useNavigate();

	useEffect(() => {
		getAllStreams()
			.then((streams) => {
				setStreams(streams);
				if (streams.length > 0) {
					const firstDate = tsToDate(getFirstStreamDate(streams));
					const lastDate = tsToDate(getLastStreamDate(streams));
					setFirstStreamDate(firstDate);
					setLastStreamDate(lastDate);
					setDateRange([firstDate, lastDate]);
				}
			})
			.catch((error) => {
				console.error("Error fetching streams:", error);
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
			<Back className="absolute top-4 left-4 cursor-pointer hover:opacity-70" size={40} onClick={() => navigate(-1)} />

                <div className="w-150 h-180 overflow-auto">
					<h1>Track Statistics</h1>
                    <ul className="truncate">
						{mostListenedSongs.map((track, index) => (
                            <li key={index} className="w-full h-6 flex items-center justify-between overflow-hidden hover:underline">
                                  <div className="text-left truncate">
                                    {index + 1}. {track.master_metadata_track_name}
								</div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    {formatSeconds(track.ms_played / 1000)}
                                </div>
							</li>
						))}
					</ul>
				</div>

                <div className="w-150 h-180 overflow-auto"> 
					<h1>Artist Statistics</h1>
                    <ul className="truncate">
						{mostListenedArtists.map((artist, index) => (
                            <li key={index} className="w-full h-6 flex items-center justify-between overflow-hidden hover:underline">
                                <div className="text-left truncate">
                                    {index + 1}. {artist.master_metadata_album_artist_name}
								</div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    {formatSeconds(artist.ms_played / 1000)}
                                </div>
							</li>
						))}
					</ul>
				</div>
			</div>

			<RangeSlider
				min={0}
				max={getDaysBetween(firstStreamDate, lastStreamDate)}
				step={1}
				defaultValue={[0, getDaysBetween(firstStreamDate, lastStreamDate)]} // This bad boy right here
				onInput={(value) => {
					const startDate = getDaysAfter(firstStreamDate, value[0]);
					const endDate = getDaysAfter(firstStreamDate, value[1]);
					setDateRange([startDate, endDate]);
				}}
				className="w-full"
			/>

			<div className="text-center">
				<input
					type="date"
					value={dateRange[0].toISOString().split("T")[0]}
					onChange={(e) => {
						if (new Date(e.target.value) > dateRange[1]) {
							alert("Start date cannot be after end date");
							return;
						}

						// check if valid date
						if (isNaN(new Date(e.target.value).getTime())) {
							return;
						}

						setDateRange([new Date(e.target.value), dateRange[1]]);
					}}
					className="mr-2"
				/>
				<input
					type="date"
					value={dateRange[1].toISOString().split("T")[0]}
					onChange={(e) => {
						if (new Date(e.target.value) < dateRange[0]) {
							alert("End date cannot be before start date");
							return;
						}

						// check if valid date
						if (isNaN(new Date(e.target.value).getTime())) {
							return;
						}

						setDateRange([dateRange[0], new Date(e.target.value)]);
					}}
					className="ml-2"
				/>

				<p>({getDaysBetween(dateRange[0], dateRange[1])} days)</p>
			</div>
		</div>
	);
};

export default StatView;
