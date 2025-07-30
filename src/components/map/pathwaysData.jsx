
export const pathwaysData = [

    {
        category: "Turning Points",
        items: ["Broke Up With Someone", "Something Ended", "Got unexpected News", "Changed Direction", "Had a Baby", "Realized Something", "Moved Away", "Other - Turning Points"]
    },
    {
        category: "Transitions",
        items: ["Moving to New Place", "Career Change", "Started Something", "A Religious Shift", "Changed My Name", "Major Life Choice", "Changed My Career", "Other - Transitions"]
    },
    {
        category: "Body & Mind",
        items: ["Significant Injury", "Surgery", "Recovery Journey", "Got a Diagnosis", "Asked For Help", "physical Transformation", "Lived With Pain", "Other - Body & Mind"]
    },
    {
        category: "Interactions",
        items: ["A Deep Conversation", "A Look I Remember", "Heard Something I Kept", "Silence", "Shared Something", "An Insult", "A Meaningful Reunion", "Other - Interactions"]
    },
    {
        category: "Milestones",
        items: ["Big Win", "Finished Something", "Started a Job", "Overcoming a Setback", "Public recognition", "Spoke Up", "Came Out", "Other - Milestones"]
    },
    {
        category: "First Times",
        items: ["First Love", "First Goodbye", "First No", "First Time Alone", "First Home", "First Failure", "First Time I Spoke Up", "Other - First Times"]
    },
    {
        category: "Absence & Loss",
        items: ["Lost an Opportunity", "Got Left Out", "No One Came", "Emptiness", "Significant Breakup", "Lost Someone", "Felt Unseen", "Other - Absence or Loss"]
    },
];

export const getCategoryForItem = (item) => {
    for (const category of pathwaysData) {
        if (category.items.includes(item)) {
            return category.category;
        }
    }
    return "General";
};
