import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CustomerInfo } from "react-native-purchases";
import { useSupabase } from "../supabase/hooks/use-supabase";
import { useUser } from "../supabase/hooks/use-user";

export function useUpdateSubscription() {
	const supabase = useSupabase();
	const queryClient = useQueryClient();
	const { data: user } = useUser();

	return useMutation({
		mutationFn: async ({
			status,
			customerInfo,
		}: {
			status: string;
			customerInfo: CustomerInfo;
		}) => {
			const { error, data } = await supabase
				.from("subscriptions")
				.upsert({
					user_id: user?.id,
					status,
					payment_provider: "revenuecat",
					payment_data: {
						revenue_cat_user_id: customerInfo.originalAppUserId,
						entitlements: Object.keys(customerInfo.entitlements.active),
						updated_at: new Date().toISOString(),
					},
					started_at: status === "active" ? new Date().toISOString() : null,
					expires_at: null, // Set if expiration info is available
				})
				.select();

			if (error) {
				throw error;
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
		},
		onError: (error) => {
			console.error("Subscription sync failed:", error);
		},
	});
}
