import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet"
import * as React from "react"

import { useColorScheme } from "~/shared/hooks"
import { NAVIGATION_THEME } from "../../constants"

const Sheet = React.forwardRef<
  BottomSheetModal,
  React.ComponentPropsWithoutRef<typeof BottomSheetModal>
>(
  (
    { index = 0, backgroundStyle, style, handleIndicatorStyle, ...props },
    ref
  ) => {
    const { colorScheme } = useColorScheme()
    const theme = NAVIGATION_THEME[colorScheme]

    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
      ),
      []
    )
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        backgroundStyle={
          backgroundStyle ?? {
            backgroundColor: theme.card,
          }
        }
        style={
          style ?? {
            borderWidth: 1,
            borderColor: theme.border,
            borderTopStartRadius: 16,
            borderTopEndRadius: 16,
          }
        }
        handleIndicatorStyle={
          handleIndicatorStyle ?? {
            backgroundColor: theme.border,
          }
        }
        backdropComponent={renderBackdrop}
        {...props}
      />
    )
  }
)

function useSheetRef() {
  return React.useRef<BottomSheetModal>(null)
}

export { Sheet, useSheetRef }
