import { generateUUID } from "@/lib/utils";
import { userWithToken } from "./(auth)/auth";
import { HomePage } from "@/components/cust/home-page";

export default async function Page() {
  const id = generateUUID();
  const session = await userWithToken();
  return (
    <HomePage
      session={session}
      key={id}
      id={id}
    />
  );
}
