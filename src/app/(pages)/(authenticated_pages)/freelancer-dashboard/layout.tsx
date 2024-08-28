import FreelancerProposalProvider from "@/app/providers/FreelancerProposalProvider";

export default function FreelancerDasboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FreelancerProposalProvider>{children}</FreelancerProposalProvider>;
}
