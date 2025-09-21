class RepSetRest {
    constructor(repRange, sets, restTime) {
        this.repRange = repRange;
        this.sets = sets;
        this.restTime = restTime;
    }
}

class Exercise {
    constructor(title, description, availableWeights, repRangeGoal=null, restPeriod=null, sets=null, videoURL=null, bodyParts=[]) {
        this.title = title;
        this.description = description;
        this.availableWeights = availableWeights;
        this.repRangeGoal = repRangeGoal;
        this.restPeriod = restPeriod;
        this.sets = sets;
        this.videoURL = videoURL;
        this.bodyParts = bodyParts;
    }

    withRepSetRest(repSetRest) {
        // Create a new exercise with the same properties but different rep/set/rest configuration
        return new Exercise(
            this.title,
            this.description,
            this.availableWeights,
            repSetRest.repRange,
            repSetRest.restTime,
            repSetRest.sets,
            this.videoURL,
            this.bodyParts
        );
    }

    getLocalStorageKey() {
        return `exercise_${this.title}_${this.repRangeGoal[0]}-${this.repRangeGoal[1]}`;
    }

    getLastSession() {
        if (localStorage.getItem(this.getLocalStorageKey())) {
            return JSON.parse(localStorage.getItem(this.getLocalStorageKey()));
        }
        return [this.availableWeights.weights[0], Array(this.sets).fill(this.repRangeGoal[0])];
    }

    saveSession(weight, reps) {
        localStorage.setItem(this.getLocalStorageKey(), JSON.stringify([weight, reps]));
    }

    getNextSession() {
        let [lastWeight, lastReps] = this.getLastSession();
        let sumReps = lastReps.reduce((a, b) => a + b, 0);
        let avgReps = sumReps / lastReps.length;
        let nextAvgGoal = avgReps + 0.5;
        let reps = Array(this.sets).fill(Math.floor(nextAvgGoal));
        let totalReps = Math.floor(nextAvgGoal) * this.sets;
        for (let i = 0; i < this.sets; i++) {
            if (totalReps < nextAvgGoal * this.sets) {
                reps[i]++;
                totalReps++;
            } else {
                break;
            }
        }

        if (Math.max(...reps) > this.repRangeGoal[1]) {
            let nextWeight = this.availableWeights.nextHeavier(lastWeight);
            return [nextWeight, Array(this.sets).fill(this.repRangeGoal[0])];
        } else if (Math.min(...reps) < this.repRangeGoal[0]) {
            let nextWeight = this.availableWeights.nextLighter(lastWeight);
            return [nextWeight, Array(this.sets).fill(this.repRangeGoal[0])];
        } else {
            return [lastWeight, reps];
        }
            

    }
}


class Session {
    constructor(id, title, description, exercises) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.exercises = exercises;
    }
}

// New WorkoutPlan class: holds a name and a list of sessions
class WorkoutPlan {
    constructor(name, sessions=[]) {
        this.name = name;
        this.sessions = sessions;
    }
}


class AvailableWeights {
    constructor() {
        this.weights = [];
    }

    nextHeavier(weight) {
        for (let w of this.weights) {
            if (w > weight) {
                return w;
            }
        }
        return this.weights[this.weights.length - 1];
    }

    nextLighter(weight) {
        for (let i = this.weights.length - 1; i >= 0; i--) {
            if (this.weights[i] < weight) {
                return this.weights[i];
            }
        }
        return this.weights[0];
    }

    closest(weight) {
        let best = this.weights[0];
        let bestDiff = Math.abs(best - weight);
        for (let w of this.weights) {
            let diff = Math.abs(w - weight);
            if (diff < bestDiff) {
                best = w;
                bestDiff = diff;
            }
        }
        return best;
    }
}

class BarbellWeights extends AvailableWeights {
    constructor(plates=[20,20,20,20,10,5,2.5,1.25]) {
        super();
        let bar_weight = 20;
        // Add all combinations of plates to the available weights
        let weightSet = new Set();

        weightSet.add(bar_weight);

        while (plates.length > 0) {
            let plate = plates.pop();
            let currentWeights = Array.from(weightSet);
            for (let w of currentWeights) {
                weightSet.add(w + plate * 2);
            }
        }

        this.weights = Array.from(weightSet).sort((a, b) => a - b);
    }
}

class DumbbellWeights extends AvailableWeights {
    constructor() {
        super();
        this.weights = [];
        for (let i = 1; i <= 5; i += 1) {
            this.weights.push(i);
        }
        for (let i = 6; i <= 50; i += 2) {
            this.weights.push(i);
        }
    }
}

class MachineWeights extends AvailableWeights {
    constructor() {
        super();
        this.weights = [];
        for (let i = 5; i <= 300; i += 5) {
            this.weights.push(i);
        }
    }
}

class CableWeights extends AvailableWeights {
    constructor() {
        super();
        this.weights = [];
        for (let i = 2.5; i <= 100; i += 2.5) {
            this.weights.push(i);
        }
    }
}

class TempWeights extends AvailableWeights {
    constructor() {
        super();
        this.weights = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    }
}


let allExercises = [];

let Squat = new Exercise(
    "Squat",
    "The Squat is the King of Exercises. It develops your legs more completely than any other exercise and also requires a solid core.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=ultWZbUMPL8",
    ['Quadriceps','Glutes','Hamstrings','Core']
);
allExercises.push(Squat);

let OverheadPress = new Exercise(
    "Overhead Press",
    "Overhead Press is a fundamental movement for building strong shoulders and arms.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=5yWaNOvgFCM",
    ['Shoulders','Triceps','Upper Chest','Core']
);
allExercises.push(OverheadPress);

let BenchPress = new Exercise(
    "Bench Press",
    "Bench Press is the best exercise to increase the strength and size of your chest and build upper body muscle. It is the most popular exercise done at the gym.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=SCVCLChPQFY",
    ['Chest','Triceps','Shoulders']
);
allExercises.push(BenchPress);

let Deadlift = new Exercise(
    "Deadlift",
    "Deadlift is a fundamental hip hinge exercise to develop the ability to lift a heavy weight off the ground. Performing deadlifts increases whole body strength, confidence and can increase testosterone levels in the body.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=1ZXobu7JvvE",
    ['Hamstrings','Glutes','Lower Back','Quadriceps']
);
allExercises.push(Deadlift);

let BarbellRow = new Exercise(
    "Barbell Row",
    "Bent Over Rows is the primary exercise for developing the upper back.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=9Gf-Ourup_k",
    ['Upper Back', 'Lower Back','Lats','Biceps','Rear Delts']
);
allExercises.push(BarbellRow);

let InclineBenchPress = new Exercise(
    "Incline Bench Press",
    "Targets the upper chest and front deltoids for improved upper-p chest development.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=lJ2o89kcnxY",
    ['Upper Chest','Shoulders','Triceps']
);
allExercises.push(InclineBenchPress);

let LatPulldown = new Exercise(
    "Lat Pulldown",
    "Develops the latissimus dorsi and upper back strength for improved pulling power.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=NAIEnMjN-6w",
    ['Lats','Upper Back','Biceps']
);
allExercises.push(LatPulldown);

let SingleArmSeatedCableRow = new Exercise(
    "Single Arm Seated Cable Row",
    "Unilateral row to build mid-back thickness and correct left/right imbalances.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=xGWx73bg0fQ",
    ['Mid Back','Lats','Biceps']
);
allExercises.push(SingleArmSeatedCableRow);

let BackExtension = new Exercise(
    "Back Extension",
    "Strengthens the lower back, glutes, and hamstrings by training hip extension under control.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=ENXyYltB7CM",
    ['Lower Back','Glutes','Hamstrings']
);
allExercises.push(BackExtension);

let TricepsPushdown = new Exercise(
    "Triceps Pushdown",
    "Isolates the triceps to build arm strength and upper-arm size.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=6Fzep104f0s",
    ['Triceps']
);
allExercises.push(TricepsPushdown);

let SingleArmTricepsExtension = new Exercise(
    "Single Arm Triceps Extension",
    "Unilateral triceps isolation to balance strength between arms and target the long head.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=vjOefY0qd1Y",
    ['Triceps']
);
allExercises.push(SingleArmTricepsExtension);

let OverheadTricepsExtension = new Exercise(
    "Overhead Triceps Extension",
    "Emphasizes the long head of the triceps through overhead positioning.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=1u18yJELsh0",
    ['Triceps','Shoulders']
);
allExercises.push(OverheadTricepsExtension);

let HipAbduction = new Exercise(
    "Hip Abduction",
    "Targets the gluteus medius and hip abductors to improve lateral stability and hip health.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=H98IP8rARy4",
    ['Glutes','Hip Abductors']
);
allExercises.push(HipAbduction);

let HipThrust = new Exercise(
    "Hip Thrust",
    "Primary glute-building movement that drives hip extension for strength and hypertrophy.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=pUdIL5x0fWg",
    ['Glutes','Hamstrings','Lower Back']
);
allExercises.push(HipThrust);

let RomanianDeadlift = new Exercise(
    "Romanian Deadlift",
    "Hamstring-focused hip-hinge to develop the posterior chain and hip-hinge mechanics.",
    new BarbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=7j-2w4-P14I",
    ['Hamstrings','Glutes','Lower Back']
);
allExercises.push(RomanianDeadlift);

let BulgarianSplitSquat = new Exercise(
    "Bulgarian Split Squat",
    "Single-leg squat variation for building quad and glute strength while improving balance.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=vgn7bSXkgkA",
    ['Quadriceps','Glutes','Hamstrings']
);
allExercises.push(BulgarianSplitSquat);

let SingleLegLegPress = new Exercise(
    "Single Leg Leg Press",
    "Unilateral leg press to target quads and glutes while reducing spinal load.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=sxF9BcDt-yY",
    ['Quadriceps','Glutes']
);
allExercises.push(SingleLegLegPress);

let HipAdduction = new Exercise(
    "Hip Adduction",
    "Targets the inner thigh (adductors) to support hip stability and balanced leg development.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=36EB4I915sU",
    ['Adductors','Inner Thigh']
);
allExercises.push(HipAdduction);

let InclineDumbbellPress = new Exercise(
    "Incline Dumbbell Press",
    "Targets the upper chest and anterior deltoid with a greater range of motion than a barbell.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=5CECBjd7HLQ",
    ['Upper Chest','Shoulders','Triceps']
);
allExercises.push(InclineDumbbellPress);

let FlatDumbbellPress = new Exercise(
    "Flat Dumbbell Press",
    "Builds chest strength and stability using independent dumbbells for balanced development.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=YQ2s_Y7g5Qk",
    ['Chest','Triceps','Shoulders']
);
allExercises.push(FlatDumbbellPress);

let DumbbellFly = new Exercise(
    "Dumbbell Fly",
    "Chest isolation movement that stretches and contracts the pecs through a wide arc.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=JFm8KbhjibM",
    ['Chest']
);
allExercises.push(DumbbellFly);

let CableFly = new Exercise(
    "Cable Fly",
    "Provides constant tension for chest isolation and helps develop the inner pecs.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=4mfLHnFL0Uw",
    ['Chest']
);
allExercises.push(CableFly);

let CableCurl = new Exercise(
    "Cable Curl",
    "Controlled biceps isolation with consistent tension throughout the range of motion.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=GNlopToAZyg",
    ['Biceps']
);
allExercises.push(CableCurl);

let HammerCurl = new Exercise(
    "Hammer Curl",
    "Targets the brachialis and forearm while adding thickness to the biceps complex.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=CFBZ4jN1CMI",
    ['Brachialis','Biceps','Forearms']
);
allExercises.push(HammerCurl);

let PreacherCurl = new Exercise(
    "Preacher Curl",
    "Stabilizes the arm to isolate the biceps and minimize momentum cheating.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=sxA__DoLsgo",
    ['Biceps']
);
allExercises.push(PreacherCurl);

let BicepCurl = new Exercise(
    "Bicep Curl",
    "Classic elbow-flexion movement for overall biceps size and strength.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=cBSD6mQIPQk",
    ['Biceps']
);
allExercises.push(BicepCurl);

let HackSquat = new Exercise(
    "Hack Squat",
    "Machine-based squat variation that places primary emphasis on the quadriceps.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=rYgNArpwE7E",
    ['Quadriceps','Glutes']
);
allExercises.push(HackSquat);

let HamstringCurl = new Exercise(
    "Hamstring Curl",
    "Isolates the hamstrings to build posterior thigh strength and knee flexion power.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=Orxowest56U",
    ['Hamstrings']
);
allExercises.push(HamstringCurl);

let LegExtension = new Exercise(
    "Leg Extension",
    "Isolates the quadriceps for knee extension strength and muscular detail.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=m0FOpMEgero",
    ['Quadriceps']
);
allExercises.push(LegExtension);

let LegPress = new Exercise(
    "Leg Press",
    "Compound lower-body pressing movement for quads, glutes, and hamstrings with back support.",
    new MachineWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=yZmx_Ac3880",
    ['Quadriceps','Glutes','Hamstrings']
);
allExercises.push(LegPress);

let Kickback = new Exercise(
    "Kickback",
    "Glute isolation exercise emphasizing hip extension and peak contraction.",
    new CableWeights(),
    null, null, null,
    null,
    ['Glutes']
);
allExercises.push(Kickback);

let DumbellOverheadPress = new Exercise(
    "Dumbell Overhead Press",
    "Dumbbell shoulder press to build deltoid strength and unilateral stability.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=Raemd3qWgJc",
    ['Shoulders','Triceps','Upper Back']
);
allExercises.push(DumbellOverheadPress);

let FrontRaise = new Exercise(
    "Front Raise",
    "Isolates the anterior deltoid to develop front-of-shoulder strength and appearance.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=hRJ6tR5-if0",
    ['Anterior Deltoid','Shoulders']
);
allExercises.push(FrontRaise);

let LateralRaise = new Exercise(
    "Lateral Raise",
    "Targets the lateral deltoid to create wider-looking shoulders.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=OuG1smZTsQQ",
    ['Lateral Deltoid','Shoulders']
);
allExercises.push(LateralRaise);

let FacePull = new Exercise(
    "Face Pull",
    "Works the rear delts and upper back to improve posture and shoulder health.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=0Po47vvj9g4",
    ['Rear Delts','Upper Back','External Rotators']
);
allExercises.push(FacePull);

let CableExternalRotation = new Exercise(
    "Cable External Rotation",
    "Rotator-cuff exercise to strengthen external rotators and enhance shoulder stability.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=2W89umxLLTM",
    ['Rotator Cuff','Shoulders']
);
allExercises.push(CableExternalRotation);

let CableInternalRotation = new Exercise(
    "Cable Internal Rotation",
    "Rotator-cuff exercise to strengthen internal rotators for balanced shoulder function.",
    new CableWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=jt5UXsbi0X0",
    ['Rotator Cuff','Shoulders']
);
allExercises.push(CableInternalRotation);

let Dips = new Exercise(
    "Dips",
    "A compound upper body exercise that targets the chest, triceps, and shoulders. Performed by lowering and raising the body between parallel bars.",
    new DumbbellWeights(),
    null, null, null,
    "https://www.youtube.com/watch?v=o2qX3Zb5mvg",
    ['Chest', 'Triceps', 'Shoulders']
);
allExercises.push(Dips);

let allBodyParts = [];
for (let ex of allExercises) {
    for (let part of ex.bodyParts) {
        if (!allBodyParts.includes(part)) {
            allBodyParts.push(part);
        }
    }
}



let reprange4x8_10 = new RepSetRest([8, 10], 4, 150);
let reprange3x8_10 = new RepSetRest([8, 10], 3, 150);
let reprange3x10_12 = new RepSetRest([10, 12], 3, 150);
let reprange3x10_15 = new RepSetRest([10, 15], 3, 150);


let FullBodySession = new Session(
    0,
    "Full Body",
    "A bit of everything",
    [
        Squat.withRepSetRest(reprange3x8_10),
        OverheadPress.withRepSetRest(reprange3x8_10),
        BenchPress.withRepSetRest(reprange3x8_10),
        Deadlift.withRepSetRest(reprange3x8_10),
        BarbellRow.withRepSetRest(reprange3x8_10)
    ]
);

let BackTricepsSession = new Session(
    1,
    "Back & Triceps",
    "Focus on back and triceps exercises",
    [
        LatPulldown.withRepSetRest(reprange3x8_10),
        SingleArmSeatedCableRow.withRepSetRest(reprange3x8_10),
        BarbellRow.withRepSetRest(reprange3x8_10),
        BackExtension.withRepSetRest(reprange3x8_10),
        TricepsPushdown.withRepSetRest(reprange3x10_12),
        SingleArmTricepsExtension.withRepSetRest(reprange3x10_12),
        OverheadTricepsExtension.withRepSetRest(reprange3x10_12),
        FacePull.withRepSetRest(reprange3x10_12)
    ]
);

let GluteHamstringSession = new Session(
    2,
    "Glute & Hamstring",
    "Focus on glute and hamstring exercises",
    [
        HipAbduction.withRepSetRest(reprange3x10_15),
        HipThrust.withRepSetRest(reprange3x8_10),
        RomanianDeadlift.withRepSetRest(reprange3x8_10),
        BulgarianSplitSquat.withRepSetRest(reprange3x8_10),
        SingleLegLegPress.withRepSetRest(reprange3x8_10),
        HipAdduction.withRepSetRest(reprange3x10_15)
    ]
);

let ChestBicepsSession = new Session(
    3,
    "Chest & Biceps",
    "Focus on chest and biceps exercises",
    [
        InclineDumbbellPress.withRepSetRest(reprange3x8_10),
        FlatDumbbellPress.withRepSetRest(reprange3x8_10),
        CableFly.withRepSetRest(reprange3x10_12),
        CableCurl.withRepSetRest(reprange3x10_12),
        HammerCurl.withRepSetRest(reprange3x10_12),
        PreacherCurl.withRepSetRest(reprange3x10_12)
    ]
);

let QuadsGlutesSession = new Session(
    4,
    "Quads & Glutes",
    "Focus on quad and glute exercises",
    [
        HackSquat.withRepSetRest(reprange3x8_10),
        HamstringCurl.withRepSetRest(reprange3x10_12),
        LegPress.withRepSetRest(reprange3x8_10),
        LegExtension.withRepSetRest(reprange3x10_12),
        HipThrust.withRepSetRest(reprange3x8_10),
        RomanianDeadlift.withRepSetRest(reprange3x10_12),
        Kickback.withRepSetRest(reprange3x10_15)
    ]
);

let ShoulderArmsSession = new Session(
    5,
    "Shoulders & Arms",
    "Focus on shoulder and arm exercises",
    [
        OverheadPress.withRepSetRest(reprange3x8_10),
        DumbellOverheadPress.withRepSetRest(reprange3x8_10),
        FrontRaise.withRepSetRest(reprange3x10_12),
        LateralRaise.withRepSetRest(reprange3x10_12),
        BicepCurl.withRepSetRest(reprange3x10_12),
        HammerCurl.withRepSetRest(reprange3x10_12),
        TricepsPushdown.withRepSetRest(reprange3x10_12),
        SingleArmTricepsExtension.withRepSetRest(reprange3x10_12),
        CableCurl.withRepSetRest(reprange3x10_12),
        FacePull.withRepSetRest(reprange3x10_12)
    ]
);

let NoahSession0 = new Session(
    0,
    "Monday",
    "",
    [
        Squat.withRepSetRest(reprange3x10_15),
        InclineDumbbellPress.withRepSetRest(reprange3x8_10),
        BicepCurl.withRepSetRest(reprange3x10_12),
        SingleArmSeatedCableRow.withRepSetRest(reprange3x10_15),
        OverheadTricepsExtension.withRepSetRest(reprange3x10_12),
        FacePull.withRepSetRest(reprange3x10_12),
        LatPulldown.withRepSetRest(reprange3x10_15),
    ]
);

let NoahSession1 = new Session(
    1,
    "Tuesday",
    "",
    [
        RomanianDeadlift.withRepSetRest(reprange3x10_15),
        BenchPress.withRepSetRest(reprange3x8_10),
        HammerCurl.withRepSetRest(reprange3x10_12),
        LateralRaise.withRepSetRest(reprange3x10_15),
        BarbellRow.withRepSetRest(reprange3x10_15),
        BackExtension.withRepSetRest(reprange3x10_15),
    ]
);

let NoahSession2 = new Session(
    2,
    "Thursday",
    "",
    [
        LegPress.withRepSetRest(reprange3x10_12),
        LegExtension.withRepSetRest(reprange3x10_12),
        HamstringCurl.withRepSetRest(reprange3x10_12),
        InclineBenchPress.withRepSetRest(reprange3x8_10),
        CableCurl.withRepSetRest(reprange3x10_12),
        CableExternalRotation.withRepSetRest(reprange3x10_15),
        CableInternalRotation.withRepSetRest(reprange3x10_15),
    ]
);

let NoahSession3 = new Session(
    3,
    "Friday",
    "",
    [
        Deadlift.withRepSetRest(reprange3x10_12),
        OverheadPress.withRepSetRest(reprange3x8_10),
        Dips.withRepSetRest(reprange3x10_12),
        HipAbduction.withRepSetRest(reprange3x10_15),
        HipAdduction.withRepSetRest(reprange3x10_15),
        CableFly.withRepSetRest(reprange3x10_12),
    ]
);

let HelenaWorkoutPlan = new WorkoutPlan("Helena", [
    FullBodySession,
    BackTricepsSession,
    GluteHamstringSession,
    ChestBicepsSession,
    QuadsGlutesSession,
    ShoulderArmsSession
]);

let NoahWorkoutPlan = new WorkoutPlan("Noah", [
    NoahSession0,
    NoahSession1,
    NoahSession2,
    NoahSession3
]);

let allWorkoutPlans = [
    HelenaWorkoutPlan,
    NoahWorkoutPlan
];

let sessionList = allWorkoutPlans[0].sessions;

// Plan selection + persistence helpers
function getPlanNames() {
    return allWorkoutPlans.map(p => p.name);
}

function getLastPlanIndex() {
    const raw = localStorage.getItem('lastPlanIndex');
    const idx = raw === null ? NaN : parseInt(raw, 10);
    return Number.isInteger(idx) ? idx : 0;
}

function saveLastPlanIndex(idx) {
    localStorage.setItem('lastPlanIndex', String(idx));
}

function renderSessionsForPlan(index) {
    const selectedPlan = allWorkoutPlans[index] || allWorkoutPlans[0];
    // update the global sessionList so other code can still use it
    sessionList = selectedPlan.sessions;

    const sessionsGrid = document.getElementById('sessionsGrid');
    if (!sessionsGrid) return;
    sessionsGrid.innerHTML = '';

    sessionList.forEach(session => {
        const sessionCard = document.createElement('a');
        sessionCard.classList.add('session-card');
        // include plan index in the URL so session page can know which plan was used
        sessionCard.href = `session.html?id=${session.id}&plan=${index}`;
        sessionCard.innerHTML = `<h2>${session.title}</h2>`;
        sessionsGrid.appendChild(sessionCard);
    });

    const currentPlanLabel = document.getElementById('currentPlanLabel');
    if (currentPlanLabel) currentPlanLabel.textContent = selectedPlan.name;
}

// Initialize by rendering last-selected plan (if any)
(function() {
    try {
        const last = getLastPlanIndex();
        renderSessionsForPlan(last);
    } catch (e) {
        // fall back to default
        renderSessionsForPlan(0);
    }
})();


