import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import SessionContext from "../contexts/sessionProvider";
import {User} from "../components/User/User";
import styles from "../styles/users.module.css"
import {UserFilter} from "../components/UserFilter/UserFilter";
import {LoginUser} from "../types/types";

/**
 * The `manage users` page, only accessible for admins
 * @constructor
 */
const Users: NextPage = () => {

    const {getSessionKey, setSessionKey} = useContext(SessionContext)
    const [users, setUsers] = useState<Array<LoginUser>>()

    // Load all users upon page load
    useEffect(() => {
        const getTempSession = () => {
            if (getSessionKey) {
                return getSessionKey()
            }
            return ""
        }

        const getAllUsers = async (route: string, sessionkey: string) => {
            return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `auth/osoc2 ${sessionkey}`
                }
            })
                .then(response => response.json()).then(json => {
                    if (!json.success) {

                        //TODO Popup of zoiets
                        return {success: false};
                    } else return json;
                })
                .catch(err => {
                    console.log(err)
                    //TODO Popup of zoiets
                    return {success: false};
                })
        }


        getAllUsers("user", getTempSession()).then(response => {
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
            setUsers(response.data)
            console.log(response.data)
        })

        // We need to disable this warning. We of course do not want do reload the page when the data is changed
        // because that is exactly what this function does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (<div className={styles.body}>
        <UserFilter/>
        <div>

            {users !== undefined ? users.map((user) => {
                console.log(user)
                const z = user.login_user
                console.log(z)
                console.log("agieioa")
                return <User user={user} key={user.login_user.login_user_id}/>
            }) : null}
        </div>
    </div>)
}

export default Users;
