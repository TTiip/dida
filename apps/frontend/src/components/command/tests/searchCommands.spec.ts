import { beforeAll, beforeEach, describe, expect, test } from "vitest"
import { useSearchCommands } from "../searchCommands"
import { useCommand } from "@/composables/command"

// 初始化搜索命令
describe('搜索命令', () => {
	beforeAll(() => {
		const { addCommand } = useCommand()
		addCommand({
			name: '回到主页',
			execute() {},
		})

		addCommand({
			name: '切换皮肤',
			execute() {},
		})
	})

	beforeEach(() => {
		const { resetSearchCommands } = useSearchCommands()
		resetSearchCommands()
	})

	// 每次请求之前都reset commands 的列表值
	test('搜索不存在的命令', () => {
		const { searchCommands, filteredCommands } = useSearchCommands()
		searchCommands('不存在的主页')

    expect(filteredCommands.value.length).toBe(0)
	})

	test('搜索已经存在的命令', () => {
		const { searchCommands, filteredCommands } = useSearchCommands()
		searchCommands('主页')

    expect(filteredCommands.value.length).toBe(1)
    expect(filteredCommands.value[0].name).toBe('回到主页')
	})

	test('搜索全部的命令', () => {
		const { searchCommands, filteredCommands } = useSearchCommands()
		searchCommands('')

    expect(filteredCommands.value.length).toBe(2)
	})
})
