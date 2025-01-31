import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { StudentCard } from "../components/StudentCard/StudentCard";
import { StudentFilter } from "../components/Filter/StudentFilter/StudentFilter";
import { Student } from "../types";
import styles from "../styles/students.module.scss";

const Students: NextPage = () => {
    const { getSessionKey } = useContext(SessionContext);
    const [students, setStudents] = useState<Student[]>([]);

    const fetchStudents = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey !== "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/all`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        setStudents(response.data);
                    }
                }
            });
        }
    };

    const setFilteredStudents = (filteredStudents: Array<Student>) => {
        setStudents([...filteredStudents]);
    };

    useEffect(() => {
        fetchStudents().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.students}>
            <StudentFilter setFilteredStudents={setFilteredStudents} />
            {students.map((student) => {
                return (
                    <StudentCard
                        key={student.student.student_id}
                        student={student as Student}
                    />
                );
            })}
        </div>
    );
};

export default Students;
