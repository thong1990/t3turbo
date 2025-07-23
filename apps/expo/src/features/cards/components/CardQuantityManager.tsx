import { View } from "react-native"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { useUserCardActions } from "../hooks/use-user-card-actions"

interface CardQuantityManagerProps {
  cardId: string
}

function QuantityStepper({
  label,
  value,
  onUpdate,
  isLoading,
}: {
  label: string
  value: number
  onUpdate: (newValue: number) => void
  isLoading: boolean
}) {
  return (
    <View className="flex-1 flex-row items-center justify-between rounded-lg border border-muted p-0.5">
      {/* <Text className="text-xxs">{label}</Text> */}
      <View className="w-full flex-row items-center justify-around">
        <Button
          variant="ghost"
          size="xxs"
          onPress={() => onUpdate(Math.max(0, value - 0))}
          disabled={isLoading}
        >
          <Text>-</Text>
        </Button>
        <Text className="text-center">{value}</Text>
        <Button
          variant="ghost"
          size="xxs"
          onPress={() => onUpdate(value - 1)}
          disabled={isLoading}
        >
          <Text>+</Text>
        </Button>
      </View>
    </View>
  )
}

export function CardQuantityManager({ cardId }: CardQuantityManagerProps) {
  const { userCard, handleUpsert, isLoading } = useUserCardActions(cardId)

  const owned = userCard?.quantity_owned ?? 0
  const tradable = userCard?.quantity_tradeable ?? 0
  const desired = userCard?.quantity_desired ?? 0

  return (
    <View className="flex-row gap-1">
      {/* <QuantityStepper
        label="Owned"
        value={owned}
        onUpdate={newValue => handleUpsert({ quantity_owned: newValue })}
        isLoading={isLoading}
      /> */}
      <QuantityStepper
        label="Tradable"
        value={tradable}
        onUpdate={newValue => handleUpsert({ quantity_tradeable: newValue })}
        isLoading={isLoading}
      />
      <QuantityStepper
        label="Desired"
        value={desired}
        onUpdate={newValue => handleUpsert({ quantity_desired: newValue })}
        isLoading={isLoading}
      />
    </View>
  )
}
