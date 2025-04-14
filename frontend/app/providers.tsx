'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/store'
import { ReactNode, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { checkAuth } from '@/store/auth-slice'
import { useAppDispatch } from '@/store/hooks'

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24 mx-auto" />
            </div>
          </div>
        }
        persistor={persistor}
      >
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </PersistGate>
    </Provider>
  )
}