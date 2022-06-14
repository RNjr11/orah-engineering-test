import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  number_of_weeks: number

  @Column()
  roll_states: string

  @Column()
  incidents: number

  @Column()
  ltmt: string

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column()
  student_count: number

  /*Class For CreateGroupInput ( Creation Of Group)*/
  public prepareToCreate(input: CreateGroupInput) {
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
    if (input.run_at !== undefined) this.run_at = input.run_at
    if (input.run_at == undefined) this.run_at = null
    if (input.student_count !== undefined) this.student_count = input.student_count
    if (input.student_count == undefined) this.student_count = 0
  }

  /*Class For UpdateGroupInput ( Updation Of Group)*/
  public prepareToUpdate(input: UpdateGroupInput) {
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
    if (input.run_at !== undefined) this.run_at = input.run_at
    if (input.run_at == undefined) this.run_at = null
    if (input.student_count !== undefined) this.student_count = input.student_count
    if (input.student_count == undefined) this.student_count = 0
  }

}
