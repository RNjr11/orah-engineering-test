import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateStudentGroupInput, UpdateStudentGroupInput } from "../interface/student-group.interface"

@Entity()
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  group_id: number

  @Column()
  incident_count: number

  /*Class For CreateStudentGroupInput ( Creation Of Students with Group)*/
  public prepareToCreate(input: CreateStudentGroupInput) {
    this.student_id = input.student_id
    this.group_id = input.group_id
    this.incident_count = input.incident_count
  }
  
  /*Class For UpdateStudentGroupInput ( Upation Of Students with Group)*/
  public prepareToUpdate(input: UpdateStudentGroupInput) {
    this.id = input.id
    this.student_id = input.student_id
    this.group_id = input.group_id
    this.incident_count = input.incident_count
  }
}
