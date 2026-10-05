import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import OpenLibraryService from '../services/openlibrary.service';
import OpenLibraryButton from '../components/OpenLibraryButton';
import AddToReadingListButtton from '../components/AddToReadingListButton';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import useToast from '../toast/useToast';
import AnimatedLayout from '../AnimatedLayout';
import EditionSelector from '../components/EditionSelector';
import { useTranslation, Trans } from 'react-i18next';
import FieldsService from '../services/fields.service';
import { useBookDetails } from '../hooks/useBookDetails';
import BookCover from '../components/BookCover';

function BookDetails() {
    let { id } = useParams();
    const [workID, setWorkID] = useState();
    const [fieldValues, setFieldValues] = useState([]);
    const toast = useToast(4000);
    const { t } = useTranslation();

    const { data: response, isLoading: loading, error: bookError } = useBookDetails(id);
    const data = response?.data;
    const description = data ? (data.description || t("book.no_description_found")) : undefined;
    const author = data ? (data.author || t("book.unknown_author")) : undefined;
    const subtitle = data ? (data.subtitle || " ") : " ";

    useEffect(() => {
        if (!bookError) return;
        const resMessage =
            (bookError.response &&
                bookError.response.data &&
                bookError.response.data.message) ||
            bookError.message ||
            bookError.toString();
        toast("error", resMessage);
    }, [bookError])

    useEffect(() => {
        if (data?.library_data?.id) {
            FieldsService.getBookValues(data.library_data.id).then(
                cfResponse => setFieldValues(cfResponse.data)
            );
        }
    }, [data?.library_data?.id])

    useEffect(() => {
        OpenLibraryService.get(id).then(
            response => {
                setWorkID(response.data.works[0].key)
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                if (error.response?.status != 404) {
                    toast("error", "OpenLibrary: " + resMessage)
                }
            }
        )
    }, [])
    

    return (
        <AnimatedLayout>
        <div className="pt-10 lg:pt-20 pb-10">
            <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-2 gap-4 justify-items-stretch	">
                <div className="lg:row-span-2 mx-auto">
                    <BookCover
                        className="shadow-2xl object-fit rounded"
                        internalID={data?.library_data?.id}
                        isbn={id}
                        size="L"
                        loaderWidth={320}
                        loaderHeight={500}
                    />
                    </div>
                <div>
                    <article className="format dark:format-invert">
                        <h2 className="mb-2">{data?.title || <Skeleton />}</h2>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">{subtitle || <Skeleton />}</h3>
                        {author ? (
                            <p className="lead">{t("book.by_author", { author: author })}</p>
                        ) : (
                            <Skeleton className="w-1/2" />
                        )}
                        <p>{description || <Skeleton count={4.5}/>}</p>
                        <p>
                            <span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">{t("book.pages")}</span> 
                            {loading ? (
                                <Skeleton width={50} />
                            ): (
                                data?.total_pages || 0
                            )}
                        </p>
                        <p><span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">ISBN</span> {id}</p>
                        {fieldValues.map(field => (
                            <p key={field.field_id}>
                                <span className="uppercase whitespace-nowrap font-medium text-gray-900 dark:text-white pr-10">{field.name}</span>
                                {field.field_type === 'boolean' ? (field.value === 'true' ? 'Yes' : 'No') : field.value}
                            </p>
                        ))}
                    </article>
                </div>
                <div className="lg:col-start-2 lg:row-start-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <AddToReadingListButtton isbn={id} data={data} description={description} author={author}/>
                        <OpenLibraryButton isbn={id} />
                        <EditionSelector work_id={workID} selected_isbn={id}/>
                    </div>
                </div>
            </div>
        </div>
        </AnimatedLayout>
    )
}

export default BookDetails
