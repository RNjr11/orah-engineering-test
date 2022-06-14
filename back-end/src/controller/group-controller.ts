import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"
import { GroupStudent } from "../entity/group-student.entity"
import { Group } from "../entity/group.entity"
import { Student } from "../entity/student.entity"
import { Roll } from "../entity/roll.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { CreateStudentGroupInput } from "../interface/student-group.interface"

export class GroupController {

  private groupRepository = getRepository(Group)
  private groupStudentRepository = getRepository(GroupStudent)
  private rollRepository = getRepository(Roll)
  private studentRollStateRepository = getRepository(StudentRollState)
  private studentRepository = getRepository(Student)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1: Finding all Groups
    return this.groupRepository.find()
    // Return the list of all groups
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: Creating A group
    const { body: params } = request

    const createGroupInput: CreateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
      run_at: params.run_at,
      student_count: params.student_count
    }

    const group = new Group()
    group.prepareToCreate(createGroupInput)

    return this.groupRepository.save(group)
    // Add a Group
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: Finding a Group By an id and Updating It
    const { body: params } = request

    let group = await this.groupRepository.findOne(params.id)

    const updateGroupInput: UpdateGroupInput = {
      id: params.id,
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
      run_at: params.run_at,
      student_count: params.student_count
    }

    group.prepareToUpdate(updateGroupInput)
    return this.groupRepository.save(group)
    // Update a Group
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: Finding a Group By an id and Removing It
    const { body: params } = request
    let groupToRemove = await this.groupRepository.findOne(params.id)
    return await this.groupRepository.remove(groupToRemove)
    // Delete a Group
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1: 

    /*Taking the group Id as Input and Finding all the student Ids in the student_group Table*/
    const { body: params } = request
    let groupStudentlist = await this.groupStudentRepository.find({ group_id: params.id })
    let studentList = []


    /*For Each Student Id, Fetching Details From The Student Table and making the Desired Output*/
    for (let i = 0; i < groupStudentlist.length; i++) {
      let student = await this.studentRepository.find({ id: groupStudentlist[i].student_id })
      studentList.push({
        "id": student[0].id,
        "first_name": student[0].first_name,
        "last_name": student[0].last_name,
        "full_name": student[0].first_name + " " + student[0].last_name
      })
    }
    return studentList

    // Return the list of Students that are in a Group
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    let groupStudentRemove = await this.groupStudentRepository.find()
    await this.groupStudentRepository.remove(groupStudentRemove)

    // 2. For each group, query the student rolls to see which students match the filter for the group
    let groupList = await this.groupRepository.find()
    let rollList = await this.rollRepository.find()
    let studentRollStateList = await this.studentRollStateRepository.find()

    let nowDate = new Date()

    /*For Each Group*/
    groupList.forEach(async (element) => {

    /* Checking The Roll list if the Rol.completed at (Roll check) was Withinn the Given Timeline of the filter (Check :1)*/
      let rollId = []
      for (let i = 0; i < rollList.length; i++) {
        let start = new Date(rollList[i].completed_at).getTime();
        let end = new Date(nowDate).getTime();
        let millisecondsDiff = Math.abs(end - start)
        let dayDiff = parseInt((millisecondsDiff / (1000 * 3600 * 24)).toString());
        if (dayDiff <= element.number_of_weeks * 7) {
          rollId.push(rollList[i].id)
        }
      }

      /*For Each Student-Roll State Checking the State is matching or not And the Corrosponding Roll id is present in the Roll list Generated Previously(Check 2) and creating an hashmap For Incident Count*/
      var studentHash = {}
      for (let i = 0; i < studentRollStateList.length; i++) {
        if (studentRollStateList[i].state == element.roll_states && rollId.includes(studentRollStateList[i].roll_id)) {
          studentHash[studentRollStateList[i].student_id] = studentHash[studentRollStateList[i].student_id] ? studentHash[studentRollStateList[i].student_id] + 1 : 1
        }
      }

      let count = 0
      /*Checking if the count matches the given Incident Limit By the Generated Hashmap (Check 3), 
      If Matches, Then storing the student, Group Data In the Student Group Table and calculating Student Count*/
      for (let i in studentHash) {
        if ((element.ltmt == ">" && studentHash[i] > element.incidents) || (element.ltmt == "<" && studentHash[i] < element.incidents)) {
          const createStudentGroupInput: CreateStudentGroupInput = {
            student_id: parseInt(i),
            group_id: element.id,
            incident_count: studentHash[i]
          }

          const groupStudent = new GroupStudent()
          groupStudent.prepareToCreate(createStudentGroupInput)
          await this.groupStudentRepository.save(groupStudent)

          count = count + 1
        }
      }

      // 3. Add the list of students that match the filter to the group
      
      /*Finding The Group And Updating The group Table with Desired Metadata */
      let group = await this.groupRepository.findOne(element.id)

      const updateGroupInput: UpdateGroupInput = {
        id: element.id,
        name: element.name,
        number_of_weeks: element.number_of_weeks,
        roll_states: element.roll_states,
        incidents: element.incidents,
        ltmt: element.ltmt,
        run_at: nowDate,
        student_count: count
      }

      group.prepareToUpdate(updateGroupInput)
      await this.groupRepository.save(group)

    })

    /*Returning A success Message*/
    return {
      "status": "success",
      "message": "Group Filter Running Process Has been Complete"
    }

    
  }
}
