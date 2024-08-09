import { onMounted, onUnmounted, ref } from 'vue'
import { useIsMac } from '@/composables'

const showCommandModal = ref(false)
export const returnValue = '延迟后,修改了showCommandModal的值为false'

export function useCommandModal() {
  function openCommandModal() {
    showCommandModal.value = true
  }

  function closeCommandModal() {
    showCommandModal.value = false
  }

  function closeCommandModalShutDownFiveSeconds(cb: (...args: any) => void, time: number = 1000) {
    showCommandModal.value = true
    setTimeout(() => {
      showCommandModal.value = false
      cb(returnValue)
    }, time)
  }

  function registerKeyboardShortcut() {
  // Command + K will show command in MacOS
  // Ctrl + K in Windows
    const isMac = useIsMac()
    const keydownHandler = (e: KeyboardEvent) => {
      if (
        (e.key === 'k')
      && (isMac.value ? e.metaKey : e.ctrlKey)
      ) {
        e.preventDefault()
        openCommandModal()
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', keydownHandler)
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', keydownHandler)
    })
  }

  return {
    showCommandModal,
    openCommandModal,
    closeCommandModal,
    closeCommandModalShutDownFiveSeconds,
    registerKeyboardShortcut,
  }
}
