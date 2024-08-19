import { describe, expect, test, vi, beforeEach } from "vitest"
import { TaskStatus, useTasksStore } from "../tasks"
import { liveListProject } from "@/tests/fixture"
import { fetchAllTasks, fetchCompleteTask, fetchCreateTask, fetchMoveTaskToProject, fetchRemoveTask, fetchRestoreTask } from "@/api"
import { createPinia, setActivePinia } from "pinia"
import { useTasksSelectorStore } from "../tasksSelector"
import { completeSmartProject } from "../smartProjects"

vi.mock('@/api')
vi.mocked(fetchCreateTask).mockImplementation(async (title: string) => createTaskResponse(title))
// 不验证类型 直接提供一个 空数据 即可
vi.mocked(fetchAllTasks).mockResolvedValue([])

function createTaskResponse (title: string) {
	return {
		title: title,
		content: '这是内容',
		status: TaskStatus.ACTIVE,
		projectId: '1',
		position: 1,
		_id: '1',
		createdAt: new Date().toString(),
		updatedAt: new Date().toString()
	}
}

function expectTaskDataStructure (task: any) {
	expect(task.title).toBe('吃饭')
	expect(task).toHaveProperty('id')
	expect(task).toHaveProperty('content')
	expect(task).toHaveProperty('status')
	expect(task).toHaveProperty('position')
	expect(task).toHaveProperty('projectId')
}

beforeEach(() => {
	setActivePinia(createPinia())

	const taskSelectorStore = useTasksSelectorStore()
	taskSelectorStore.currentSelector = liveListProject

	// 重置 mock
	// vi.mocked(fetchCreateTask).mockClear()
	// 重置所有的 mock
	vi.clearAllMocks()
})

describe('tasks store', () => {
	describe('添加任务', () => {

		test('添加task 当前的 currentActiveTask 是一个 undefined 的时候不应该添加', async () => {
			const taskSelectorStore = useTasksSelectorStore()

			const taskStore = useTasksStore()
			taskSelectorStore.currentSelector = undefined

			const task = await taskStore.addTask('吃饭')

			expect(task).toBeUndefined()
			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchCreateTask).not.toBeCalled()
		})

		test('添加task 当前的 currentActiveTask 类型是一个 smartProject 的时候不应该添加', async () => {
			const taskSelectorStore = useTasksSelectorStore()

			const taskStore = useTasksStore()
			taskSelectorStore.currentSelector = completeSmartProject

			const task = await taskStore.addTask('吃饭')

			expect(task).toBeUndefined()
			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchCreateTask).not.toBeCalled()
		})

		test('添加task 应当在列表的最前面', async () => {
			const taskStore = useTasksStore()

			await taskStore.addTask('吃饭')
			const task1 = await taskStore.addTask('运动')

			expect(task1?.title).toBe('运动')
			expect(taskStore.tasks.length).toBe(2)
			expect(taskStore.tasks[0]).toEqual(task1)
			expect(taskStore.currentActiveTask).toEqual(task1)
			expect(fetchCreateTask).toBeCalledWith(task1?.title, liveListProject.id)
		})
	})

	describe('删除任务', () => {
		test('删除任务', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!

			await taskStore.removeTask(task)

			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchRemoveTask).toBeCalledWith(task?.id)
		})
	})

	describe('完成任务', () => {
		test('完成任务', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!

			await taskStore.completeTask(task)

			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchCompleteTask).toBeCalledWith(task?.id)
		})
	})

	describe('恢复完成任务', () => {
		test('恢复完成任务', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!

			await taskStore.restoreTask(task)

			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchRestoreTask).toBeCalledWith(task?.id)
		})
	})

	describe('移动任务', () => {
		test('移动任务', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!

			const ProjectId = 'xx'
			await taskStore.moveTaskToProject(task, ProjectId)

			expect(taskStore.tasks.length).toBe(0)
			expect(taskStore.currentActiveTask).toBeUndefined()
			expect(fetchMoveTaskToProject).toBeCalledWith(task?.id, ProjectId)
		})
	})

	describe('修改任务', () => {
		test('修改任务', async () => {
			const taskStore = useTasksStore()
			await taskStore.updateTasks([createTaskResponse('吃饭')])

			expect(taskStore.tasks.length).toBe(1)
			// ts 没有必要检测类型 编写的时候就会提示
			// expectTaskDataStructure(taskStore.tasks[0])
		})

		test('根据id去修改 任务状态', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!
			await taskStore.changeActiveTask(task.id)

			expect(taskStore.currentActiveTask).toEqual(task)
		})

		test('根据任务本身去修改 任务状态', async () => {
			const taskStore = useTasksStore()
			const task = (await taskStore.addTask('吃饭'))!
			await taskStore.changeActiveTask(task)

			expect(taskStore.currentActiveTask).toEqual(task)
		})
	})

	describe('搜索所有的未删除状态的任务', () => {
		test('搜索所有的未删除状态的任务', async () => {
			const taskStore = useTasksStore()
			await taskStore.findAllTasksNotRemoved()

			expect(fetchAllTasks).toBeCalledWith({ status: TaskStatus.ACTIVE })
			expect(fetchAllTasks).toBeCalledWith({ status: TaskStatus.COMPLETED })
		})
	})
})
