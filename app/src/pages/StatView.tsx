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

	const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
	const [firstStreamDate, setFirstStreamDate] = useState<Date>();
	const [lastStreamDate, setLastStreamDate] = useState<Date>();

	const [dynamicBackgrounds, setDynamicBackgrounds] = useState<boolean>(false);

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

	const stringToHash = (str: string) => {
		if (!str) return 0;
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	};

	return (
		<div>
			<h1 className="title">Spotify Window</h1>
			<Back className="absolute top-4 left-4 cursor-pointer hover:opacity-70" size={40} onClick={() => navigate(-1)} />
			<div className="flex flex-row justify-between items-start gap-4 p-4 h-[700px]">
				<div className="flex flex-col overflow-hidden w-150 h-full">
					<h1>Track Statistics</h1>
					<ul className="truncate overflow-auto h-full">
						{mostListenedSongs.map((track, index) => (
							<li
								key={index}
								className={`w-full h-[30px] flex items-center justify-between overflow-hidden hover:underline duration-150 ${
									track.spotify_track_uri ? "cursor-pointer" : ""
								}`}
								style={
									dynamicBackgrounds
										? {
												background: `hsl(${stringToHash(track.master_metadata_track_name + track.spotify_track_uri || "")}, 50%, 20%)`,
										  }
										: {}
								}
								onClick={() => {
									window.open(`https://open.spotify.com/track/${track.spotify_track_uri?.split(":").pop()}`, "_blank");
								}}
							>
								<div className="ml-2 text-left truncate text-ellipsis">
									<strong className="inline-block w-[30px]">{index + 1}.</strong> {track.master_metadata_track_name}
								</div>
								<div className="text-left w-[100px] flex-shrink-0 ml-2">{formatSeconds(track.ms_played / 1000)}</div>
							</li>
						))}
					</ul>
				</div>

				<div className="flex flex-col overflow-hidden w-150 h-full">
					<h1>Artist Statistics</h1>
					<ul className="truncate overflow-auto h-full">
						{mostListenedArtists.map((artist, index) => (
							<li
								key={index}
								className="w-full h-[30px] flex items-center justify-between overflow-hidden hover:underline duration-150"
								style={
									dynamicBackgrounds
										? {
												background: `hsl(${stringToHash(artist.master_metadata_album_artist_name || "")}, 50%, 20%)`,
										  }
										: {}
								}
							>
								<div className="ml-2 text-left truncate text-ellipsis">
									<strong className="inline-block w-[30px]">{index + 1}.</strong> {artist.master_metadata_album_artist_name}
								</div>
								<div className="text-left w-[100px] flex-shrink-0 ml-2">{formatSeconds(artist.ms_played / 1000)}</div>
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

				<div className="mt-4">
					<label className="flex items-center justify-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={dynamicBackgrounds}
							onChange={(e) => setDynamicBackgrounds(e.target.checked)}
							className="w-4 h-4"
						/>
						<span>Enable Dynamic Backgrounds</span>
					</label>
				</div>
			</div>
		</div>
	);
};

export default StatView;
