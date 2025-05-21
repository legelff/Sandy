import { Plan } from '../components/features/PlanSelection';

export const ownerPlans: Plan[] = [
    {
        id: 'owner-basic',
        title: 'Basic Plan',
        price: 0,
        features: [
            { text: '1 pet', included: true },
            { text: 'Cats & dogs only', included: true },
            { text: '5 requests/day', included: true },
            { text: 'Basic service package', included: true },
            { text: '5% booking fee', included: true },
            { text: 'With ads', included: true },
        ],
    },
    {
        id: 'owner-premium',
        title: 'Premium Plan',
        price: 9,
        features: [
            { text: 'Unlimited pets', included: true },
            { text: 'All pet species', included: true },
            { text: 'Unlimited requests', included: true },
            { text: 'Extended service package', included: true },
            { text: '2% booking fee', included: true },
            { text: 'No ads', included: true },
        ],
    },
];

export const sitterPlans: Plan[] = [
    {
        id: 'sitter-basic',
        title: 'Basic Plan',
        price: 0,
        features: [
            { text: 'Cats & dogs only', included: true },
            { text: 'Sit 2 pets/week', included: true },
            { text: '5% booking fee', included: true },
            { text: 'No insurance', included: true },
            { text: 'No pet sitting training', included: true },
            { text: 'With ads', included: true },
        ],
    },
    {
        id: 'sitter-premium',
        title: 'Part-time Job',
        price: 0,
        features: [
            { text: 'All pet species', included: true },
            { text: 'Unlimited pets/week', included: true },
            { text: 'No booking fee', included: true },
            { text: 'Insurance included', included: true },
            { text: 'Pet sitting training included', included: true },
            { text: 'No ads', included: true },
            { text: 'Get paid to sit pets', included: true },
        ],
    },
];
