import { ProjectPageClient } from "./ProjectPageClient";

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    return <ProjectPageClient id={id} />;
}
