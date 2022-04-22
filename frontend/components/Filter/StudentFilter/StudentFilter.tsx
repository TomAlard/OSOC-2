import styles from "../Filter.module.css";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { getNextSort, Role, Sort, Student } from "../../../types/types";
import SessionContext from "../../../contexts/sessionProvider";
import { useRouter } from "next/router";
import Image from "next/image";
import CheckIconColor from "../../../public/images/green_check_mark_color.png";
import CheckIcon from "../../../public/images/green_check_mark.png";
import ExclamationIconColor from "../../../public/images/exclamation_mark_color.png";
import ExclamationIcon from "../../../public/images/exclamation_mark.png";
import ForbiddenIconColor from "../../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../../public/images/forbidden_icon.png";

export const StudentFilter: React.FC<{
    setFilteredStudents: (user: Array<Student>) => void;
}> = ({ setFilteredStudents }) => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const router = useRouter();

    const [firstNameFilter, setFirstNameFilter] = useState<string>("");
    const [lastNameFilter, setLastNameFilter] = useState<string>("");
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [firstNameSort, setFirstNameSort] = useState<Sort>(Sort.NONE);
    const [lastNameSort, setLastNameSort] = useState<Sort>(Sort.NONE);
    const [emailSort, setEmailSort] = useState<Sort>(Sort.NONE);
    const [filterYes, setFilterYes] = useState<boolean>(false);
    const [filterMaybe, setFilterMaybe] = useState<boolean>(false);
    const [filterNo, setFilterNo] = useState<boolean>(false);
    const [alumni, setAlumni] = useState<boolean>(false);
    const [studentCoach, setstudentCoach] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [osocYear, setOsocYear] = useState<string>("");

    // Roles used in the dropdown
    const [roles, setRoles] = useState<Array<Role>>([]);
    // A set of active roles
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [dropdownActive, setDropdownActive] = useState<boolean>(false);

    const fetchRoles = async () => {
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        const responseRoles = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/role/all`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then((json) => {
                if (!json.success) {
                    return { success: false };
                } else return json;
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
        if (setSessionKey) {
            setSessionKey(responseRoles.sessionkey);
        }
        setRoles(responseRoles.data);
    };

    useEffect(() => {
        if (roles.length === 0) {
            fetchRoles().then(() => search());
        } else {
            search().then();
        }
    }, [
        firstNameSort,
        lastNameSort,
        emailSort,
        alumni,
        studentCoach,
        statusFilter,
        selectedRoles,
    ]);

    const toggleFirstNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setFirstNameSort((prev) => getNextSort(prev));
    };

    const toggleLastNameSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLastNameSort((prev) => getNextSort(prev));
    };

    const toggleEmailSort = async (e: SyntheticEvent) => {
        e.preventDefault();
        setEmailSort((prev) => getNextSort(prev));
    };

    const toggleFilterYes = async (e: SyntheticEvent) => {
        e.preventDefault();
        //This is because the call is async
        if (!filterYes) {
            setStatusFilter(() => "YES");
        } else {
            setStatusFilter(() => "");
        }
        setFilterYes((bool) => !bool);
    };

    const toggleFilterMaybe = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterMaybe) {
            setStatusFilter(() => "MAYBE");
        } else {
            setStatusFilter(() => "");
        }
        setFilterMaybe((bool) => !bool);
    };

    const toggleFilterNo = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!filterNo) {
            setStatusFilter(() => "NO");
        } else {
            setStatusFilter(() => "");
        }
        setFilterNo((bool) => !bool);
    };

    const toggleAlumni = async (e: SyntheticEvent) => {
        e.preventDefault();
        setAlumni((prev) => !prev);
    };

    const toggleStudentCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setstudentCoach((prev) => !prev);
    };

    const selectRole = (role: string) => {
        // Unselect role
        if (selectedRoles.has(role)) {
            selectedRoles.delete(role);
        } else {
            // Select role
            selectedRoles.add(role);
        }
        setSelectedRoles(selectedRoles);
    };

    const searchPress = (e: SyntheticEvent) => {
        e.preventDefault();
        search().then();
    };

    const search = async () => {
        const filters = [];
        if (firstNameFilter !== "") {
            filters.push(`firstNameFilter=${firstNameFilter}`);
        }
        if (firstNameSort !== Sort.NONE) {
            filters.push(`firstNameSort=${firstNameSort}`);
        }
        if (lastNameFilter !== "") {
            filters.push(`lastNameFilter=${lastNameFilter}`);
        }
        if (lastNameSort !== Sort.NONE) {
            filters.push(`lastNameSort=${lastNameSort}`);
        }
        if (emailFilter !== "") {
            filters.push(`emailFilter=${emailFilter}`);
        }
        if (emailSort !== Sort.NONE) {
            filters.push(`emailSort=${emailSort}`);
        }
        if (alumni) {
            filters.push(`alumniFilter=${alumni}`);
        }
        if (studentCoach) {
            filters.push(`coachFilter=${studentCoach}`);
        }
        if (osocYear !== "") {
            filters.push(`osocYear=${osocYear}`);
        }
        if (selectedRoles.size !== 0) {
            filters.push(
                `roleFilter=${Array.from(selectedRoles.values()).toString()}`
            );
        }
        if (statusFilter !== "") {
            filters.push(`statusFilter=${statusFilter}`);
        }
        const query = filters.length > 0 ? `?${filters.join("&")}` : "";
        await router.push(`/students${query}`);

        const sessionKey = getSessionKey ? await getSessionKey() : "";
        if (sessionKey !== "") {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/student/filter` + query,
                {
                    method: "GET",
                    headers: {
                        Authorization: `auth/osoc2 ${sessionKey}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .then((json) => {
                    console.log(json);
                    if (!json.success) {
                        return { success: false };
                    } else return json;
                })
                .catch((err) => {
                    console.log(err);
                    return { success: false };
                });
            if (setSessionKey) {
                setSessionKey(response.sessionkey);
            }
            setFilteredStudents(response.data);
        }
    };

    return (
        <div className={styles.studentfilter}>
            <div className={styles.query}>
                <div onClick={toggleFirstNameSort}>
                    Firstname
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                firstNameSort === Sort.ASCENDING
                                    ? styles.up
                                    : ""
                            } ${
                                firstNameSort === Sort.NONE
                                    ? styles.dot
                                    : styles.triangle
                            }`}
                        />
                    </div>
                </div>

                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setFirstNameFilter(e.target.value)}
                />

                <div onClick={toggleLastNameSort}>
                    Lastname
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                lastNameSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                lastNameSort === Sort.NONE
                                    ? styles.dot
                                    : styles.triangle
                            }`}
                        />
                    </div>
                </div>

                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setLastNameFilter(e.target.value)}
                />
            </div>

            <div className={styles.query}>
                <div onClick={toggleEmailSort}>
                    Email
                    <div className={styles.triangleContainer}>
                        <div
                            className={`${
                                emailSort === Sort.ASCENDING ? styles.up : ""
                            } ${
                                emailSort === Sort.NONE
                                    ? styles.dot
                                    : styles.triangle
                            }`}
                        />
                    </div>
                </div>
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="Search.."
                    onChange={(e) => setEmailFilter(e.target.value)}
                />
                Osoc edition
                {/* Maybe dropdown */}
                <input
                    className={`input ${styles.input}`}
                    type="text"
                    placeholder="2022"
                    onChange={(e) => setOsocYear(e.target.value)}
                />
            </div>

            <div className={styles.studentButtonsContainer}>
                <button
                    className={`${alumni ? styles.active : styles.inactive}`}
                    onClick={toggleAlumni}
                >
                    Alumni Only
                </button>

                <button
                    className={`${
                        studentCoach ? styles.active : styles.inactive
                    }`}
                    onClick={toggleStudentCoach}
                >
                    Student Coach Only
                </button>

                <div
                    className={`dropdown ${dropdownActive ? "is-active" : ""}`}
                >
                    <div
                        className={`dropdown-trigger ${
                            dropdownActive || selectedRoles.size > 0
                                ? styles.active
                                : styles.inactive
                        } ${styles.dropdownTrigger}`}
                        onClick={() => setDropdownActive(!dropdownActive)}
                    >
                        {selectedRoles.size > 0
                            ? selectedRoles.size === 1
                                ? `${selectedRoles.size} role selected`
                                : `${selectedRoles.size} roles selected`
                            : "No role selected"}
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${
                                    dropdownActive ? styles.up : ""
                                } ${styles.triangle}`}
                            />
                        </div>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            {roles !== undefined
                                ? roles.map((role) => (
                                      <div
                                          className={`${
                                              styles.dropdownItem
                                          } dropdown-item ${
                                              selectedRoles.has(role.name)
                                                  ? styles.selected
                                                  : ""
                                          }`}
                                          key={role.role_id}
                                          onClick={() => selectRole(role.name)}
                                      >
                                          {role.name}
                                      </div>
                                  ))
                                : null}
                        </div>
                    </div>
                </div>

                <div className={styles.studentButtons}>
                    <div className={styles.buttonContainer}>
                        <Image
                            className={styles.buttonImage}
                            src={filterYes ? CheckIconColor : CheckIcon}
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleFilterYes}
                        />
                        <p>YES</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            className={styles.buttonImage}
                            src={
                                filterMaybe
                                    ? ExclamationIconColor
                                    : ExclamationIcon
                            }
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleFilterMaybe}
                        />
                        <p>MAYBE</p>
                    </div>

                    <div className={styles.buttonContainer}>
                        <Image
                            className={styles.buttonImage}
                            src={filterNo ? ForbiddenIconColor : ForbiddenIcon}
                            width={30}
                            height={30}
                            alt={"Disabled"}
                            onClick={toggleFilterNo}
                        />
                        <p>NO</p>
                    </div>
                </div>

                <button onClick={searchPress}>Search</button>
            </div>
        </div>
    );
};
