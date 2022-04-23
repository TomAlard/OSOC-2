import styles from "./OsocCreate.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { getNextSort, OsocEdition, Sort } from "../../types/types";
import SessionContext from "../../contexts/sessionProvider";
import { useRouter } from "next/router";

export const OsocCreateFilter: React.FC<{
    updateOsoc: (osocs: Array<OsocEdition>) => void;
}> = ({ updateOsoc }) => {
    // const [osocCreate, setOsocCreate] = useState<string>("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [yearSort, setYearSort] = useState<Sort>(Sort.NONE);
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [loading, isLoading] = useState<boolean>(false); // Check if we are executing a request

    const router = useRouter();

    /**
     * Every time a filter changes we perform a search, on initial page load we also get the filter settings from
     * the query parameters
     * This makes the filter responsible for all the user data fetching
     */
    useEffect(() => {
        if (loading) return;
        search().then();
    }, [yearSort]);

    const toggleYearSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (loading) return;
        setYearSort(getNextSort(yearSort));
    };

    /**
     * Explicitly tell the frontend to execute the current query
     * @param e
     */
    const searchPress = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (loading) return;
        search().then();
    };

    /**
     * Build and execute the query
     */
    const search = async () => {
        isLoading(true);
        const filters = [];

        if (yearFilter !== "") {
            filters.push(`yearFilter=${yearFilter}`);
        }

        if (yearSort !== Sort.NONE) {
            filters.push(`yearSort=${yearSort}`);
        }

        const query = filters.length > 0 ? `?${filters.join("&")}` : "";
        await router.push(`/osocs${query}`);

        const sessionKey = getSessionKey ? await getSessionKey() : "";
        if (sessionKey !== "") {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/osoc/filter` + query,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `auth/osoc2 ${sessionKey}`,
                    },
                }
            )
                .then((response) => response.json())
                .catch((err) => {
                    console.log(err);
                });
            if (setSessionKey && response && response.sessionkey) {
                setSessionKey(response.sessionkey);
            }
            updateOsoc(response.data);
            isLoading(false);
        }
    };

    /**
     * Create the new osoc edition
     */
    // const create = async () => {
    //     const sessionKey = getSessionKey ? await getSessionKey() : "";
    //     if (sessionKey !== "") {
    //         const response = await fetch(
    //             `${process.env.NEXT_PUBLIC_API_URL}/osoc/create` + osocCreate,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Accept: "application/json",
    //                     Authorization: `auth/osoc2 ${sessionKey}`,
    //                 },
    //             }
    //         )
    //             .then((response) => response.json())
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //         if (setSessionKey && response && response.sessionkey) {
    //             setSessionKey(response.sessionkey);
    //         }
    //         updateOsoc(response.data);
    //     }
    // };

    return (
        <div className={styles.filter}>
            <form className={styles.form}>
                {/* This shouldn't be a styles query probably */}
                <div className={styles.query}>
                    <input
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Year.."
                        onChange={(e) => setOsocCreate(e.target.value)}
                    />
                    <button onClick={searchPress}>Create</button>
                </div>

                <div className={styles.query}>
                    <div onClick={toggleYearSort}>
                        Year
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${
                                    yearSort === Sort.ASCENDING ? styles.up : ""
                                } ${
                                    yearSort === Sort.NONE
                                        ? styles.dot
                                        : styles.triangle
                                }`}
                            />
                        </div>
                    </div>

                    <input
                        className={`input ${styles.input}`}
                        type="text"
                        placeholder="Year.."
                        onChange={(e) => setYearFilter(e.target.value)}
                    />
                    <button onClick={searchPress}>Search</button>
                </div>
            </form>
        </div>
    );
};
