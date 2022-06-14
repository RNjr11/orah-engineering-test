/*Created Student-Group Interface For saving and Updating Students With group Id in student_group Table*/
export interface CreateStudentGroupInput {
    student_id: number
    group_id: number
    incident_count: number
}

export interface UpdateStudentGroupInput {
    id: number
    student_id: number
    group_id: number
    incident_count: number
}