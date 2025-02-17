import { createContext, createEffect, onMount, useContext } from "solid-js"
import { createStore } from "solid-js/store"
import { invoke } from "@tauri-apps/api/tauri"

export type File = {
  fileContent: string
  filePath: string
}

type GlobalState = {
  localFolderPath: string
  files: File[]
  currentlyOpenFile?: File
}

export function createGlobalState() {
  const [state, setState] = createStore<GlobalState>({
    localFolderPath: "",
    files: [],
  })

  onMount(async () => {
    const localFolderPath = localStorage.getItem("localFolderPath")
    if (localFolderPath) {
      const connectedFolder = await invoke("connect_folder_with_path", {
        path: localFolderPath,
      })
      setState("localFolderPath", localFolderPath)
      if (connectedFolder !== null) {
        // @ts-ignore
        setState("localFolderPath", connectedFolder[0])
        // @ts-ignore
        setState("files", connectedFolder[1])
      }
    }
  })

  createEffect(() => {
    if (state.localFolderPath) {
      localStorage.setItem("localFolderPath", state.localFolderPath)
    }
  })

  return {
    state,
    set: setState,
  }
}

const GlobalStateCtx = createContext<ReturnType<typeof createGlobalState>>()

export const GlobalStateProvider = GlobalStateCtx.Provider

export const useGlobalState = () => {
  const ctx = useContext(GlobalStateCtx)
  if (!ctx) throw new Error("useGlobalState must be used within UserProvider")
  return ctx
}
