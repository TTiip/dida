import { beforeEach, describe, expect, test, vi } from "vitest"
import { useCommandModal, returnValue } from "../commandModal"
import { fireEvent, useSetup } from '@/tests/helper'
import * as misc from '@/composables/misc'
import { computed } from "vue"

describe('测试命令 command modal', () => {
	// 每次调用前都重置状态 非常重要!!!
  beforeEach(() => {
    const { closeCommandModal } = useCommandModal()
    closeCommandModal()
  })
	test('应该打开命令', () => {
		const { openCommandModal, showCommandModal } = useCommandModal()
		openCommandModal()
		expect(showCommandModal.value).toBe(true)
	})

	test('应该关闭命令', () => {
		const { closeCommandModal, showCommandModal } = useCommandModal()
		closeCommandModal()
		expect(showCommandModal.value).toBe(false)
	})

	test('应该打开以后五秒自动关闭命令并且返回对应的值', () => {
		const time = 5000
    vi.useFakeTimers()
		const fn = vi.fn()
		const { closeCommandModalShutDownFiveSeconds, showCommandModal } = useCommandModal()
		closeCommandModalShutDownFiveSeconds(fn, time)
    vi.advanceTimersByTime(time)

		expect(showCommandModal.value).toBe(false)
		expect(fn).toBeCalledWith(returnValue)
	})

	test('使用 cmd+k 打开命令', () => {
		vi.spyOn(misc, 'useIsMac').mockReturnValueOnce(computed(() => true))

		const { registerKeyboardShortcut, showCommandModal } = useCommandModal()
		const { wrapper } = useSetup(() => {
			registerKeyboardShortcut()
		})

		fireEvent.keyDown({
      key: 'k',
      metaKey: true,
    })

		expect(showCommandModal.value).toBe(true)

		// 每次执行完 mounted 以后一定记得要 清除掉!!!
		wrapper.unmount()
	})

	test('使用 ctrl+k 打开命令', () => {
		vi.spyOn(misc, 'useIsMac').mockReturnValueOnce(computed(() => false))

		const { registerKeyboardShortcut, showCommandModal } = useCommandModal()
		const { wrapper } = useSetup(() => {
			registerKeyboardShortcut()
		})

		fireEvent.keyDown({
      key: 'k',
      ctrlKey: true,
    })

		expect(showCommandModal.value).toBe(true)

		// 每次执行完 mounted 以后一定记得要 清除掉!!!
		wrapper.unmount()
	})
})
