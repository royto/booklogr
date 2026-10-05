import React from 'react'
import { useThemeMode } from 'flowbite-react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Img } from 'react-image'
import { getAPIUrl } from '../services/api.utils';

function BookCover({
    src,
    internalID,
    isbn,
    size = "M",
    refreshKey,
    className,
    loaderWidth = 96,
    loaderHeight = 128,
    loaderBorderRadius = 0,
    width,
    height,
    alt = ""
}) {
    const theme = useThemeMode();
    const fallbackCover = theme.mode === "dark" ? "/fallback-cover-light.svg" : "/fallback-cover.svg";
    const coverSources = src ?? (isbn ? [
        internalID && getAPIUrl(`/v1/books/${internalID}/cover`),
        `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`
    ].filter(Boolean) : undefined);
    const imageSources = refreshKey == null
        ? coverSources
        : (Array.isArray(coverSources) ? coverSources : [coverSources])
            .filter(Boolean)
            .map(source => `${source}${source.includes("?") ? "&" : "?"}coverVersion=${encodeURIComponent(refreshKey)}`);

    return (
        <Img
            crossorigin="anonymous"
            className={className}
            src={imageSources}
            alt={alt}
            width={width}
            height={height}
            loader={<Skeleton count={1} width={loaderWidth} height={loaderHeight} borderRadius={loaderBorderRadius} inline />}
            unloader={<img className={className} src={fallbackCover} width={width} height={height} alt={alt} />}
        />
    )
}

export default BookCover
