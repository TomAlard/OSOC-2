import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import Image from "next/image";
import SessionContext from "../../contexts/sessionProvider";
import { AccountStatus, LoginUser } from "../../types";
import { useSockets } from "../../contexts/socketProvider";

export const User: React.FC<{
    user: LoginUser;
    removeUser: (user: LoginUser) => void;
}> = ({ user, removeUser }) => {
    const [name] = useState<string>(user.person.firstname);
    const [email] = useState<string>(user.person.email);
    const [isAdmin, setIsAdmin] = useState<boolean>(user.is_admin);
    const [isCoach, setIsCoach] = useState<boolean>(user.is_coach);
    const [status, setStatus] = useState<AccountStatus>(user.account_status);
    const { sessionKey } = useContext(SessionContext);
    const { socket } = useSockets();
    const userId = user.login_user_id;

    // needed for when an update is received via websockets
    useEffect(() => {
        setIsAdmin(user.is_admin);
        setIsCoach(user.is_coach);
        setStatus(user.account_status);
    }, [user]);

    const setUserRole = async (
        route: string,
        changed_val: string,
        admin_bool: boolean,
        coach_bool: boolean,
        status_enum: AccountStatus
    ) => {
        const json_body = JSON.stringify({
            isCoach: coach_bool,
            isAdmin: admin_bool,
            accountStatus: status_enum,
        });
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` +
                route +
                "/" +
                userId.toString(),
            {
                method: "POST",
                body: json_body,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then(async (json) => {
                if (!json.success) {
                    return { success: false };
                } else {
                    return json;
                }
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
        if (res.success !== false) {
            socket.emit("updateUser", userId);
        }
        return res;
    };

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "admin",
            "admin",
            !isAdmin,
            isCoach,
            status
        );
        if (response.success) {
            setIsAdmin(!isAdmin);
        }
    };

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "coach",
            "coach",
            isAdmin,
            !isCoach,
            status
        );
        if (response.success) {
            setIsCoach(!isCoach);
        }
    };

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (status === AccountStatus.ACTIVATED) {
            const response = await setUserRole(
                "coach",
                "activated",
                isAdmin,
                isCoach,
                AccountStatus.DISABLED
            );
            if (response && response.success) {
                setStatus(AccountStatus.DISABLED);
            }
        } else if (status === AccountStatus.DISABLED) {
            const response = await setUserRole(
                "coach",
                "activated",
                isAdmin,
                isCoach,
                AccountStatus.ACTIVATED
            );
            if (response && response.success) {
                setStatus(AccountStatus.ACTIVATED);
            }
        }
    };

    const activateUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "coach",
            "enum",
            isAdmin,
            isCoach,
            AccountStatus.ACTIVATED
        );
        if (response.success) {
            setStatus(AccountStatus.ACTIVATED);
        }
    };

    const deleteUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` +
                "admin/" +
                userId.toString(),
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then(async (json) => {
                if (!json.success) {
                    return { success: false };
                }
                removeUser(user);
                return json;
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
    };

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <p>{name}</p>
                {status === AccountStatus.PENDING ? (
                    <button className={styles.pending} onClick={activateUser}>
                        ACTIVATE
                    </button>
                ) : null}
            </div>

            <p>{email}</p>
            <div className={styles.buttons}>
                <div className={styles.buttonContainer} onClick={toggleIsAdmin}>
                    <div className={styles.button}>
                        <Image
                            className={styles.buttonImage}
                            width={30}
                            height={30}
                            src={isAdmin ? AdminIconColor : AdminIcon}
                            alt={"Admin"}
                        />
                    </div>
                </div>
                <div className={styles.buttonContainer} onClick={toggleIsCoach}>
                    <div className={styles.button}>
                        <Image
                            className={styles.buttonImage}
                            src={isCoach ? CoachIconColor : CoachIcon}
                            width={30}
                            height={30}
                            alt={"Coach"}
                        />
                    </div>
                </div>
                <div className={styles.buttonContainer} onClick={toggleStatus}>
                    <div className={styles.button}>
                        <Image
                            className={styles.buttonImage}
                            src={
                                status === AccountStatus.DISABLED
                                    ? ForbiddenIconColor
                                    : ForbiddenIcon
                            }
                            width={30}
                            height={30}
                            alt={"Disabled"}
                        />
                    </div>
                </div>
            </div>
            <button
                className={`delete ${styles.delete}`}
                onClick={deleteUser}
            />
        </div>
    );
};
