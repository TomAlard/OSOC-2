import React from "react";
import styles from "./Settings.module.scss"
import {Loginuser} from "../../types/types";

export const SettingsComponent: React.FC<{person:Loginuser }> = ({person}) => {


    return (
        <div className={styles.settings}>

            <text>current name: {person.login_user.person.firstname}</text>
            <br/>
            <text>new name</text>
            <input/>
            <button>
                Change name
            </button>

            <text>current password</text>
            <input/>
            <text>new password</text>
            <input/>
            <button>
                Change password
            </button>
        </div>
    )
}
