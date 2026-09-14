export const DB_NAME = "bruteForce";

export const cookieOptions = {
    httpOnly : true,
    secure : true,
};

export const customMessages = (problemCount) => {
    
    const message = [
    `👀 Psst... remember these problem?
    
    You marked ${problemCount} problems for today because apparently *future you* was supposed to deal with it. 😂
    
    Well, future you has arrived.
    
    Go solve it. 🫡💻`,
    
    `🍌 Your ${problemCount} DSA problems has been waiting patiently...
    
    You told yourself you'd revisit ${problemCount === 1 ? `it` : `them`} today.
    Your past self remembers. Your code remembers. 😶
    
    Now go show that problem who's boss. 😎💻`,
    
    `🧠 Time to revisit!
    
    You marked ${problemCount} DSA problems for today.
    No excuses — just one problem, one pattern, one step closer. 🚀
    
    Happy solving! 💻
    `,
    
    `🚨 DSA is calling!
    
    Remember the ${problemCount} problems you marked to revisit today? 👀
    Yep, *${problemCount === 1 ? "that one" : "those ones"}*.
    
    Time to dust off the logic, crack the pattern, and make your future self proud. 💪🧠
    
    Go get it! 🚀
    `,
    ];

    return message;
};


export const customSubjects = (problemCount) => {
    const subjects = [
       `👀 Psst... Your DSA ${problemCount === 1 ? "Problem is" : "Problems are"} Waiting`, 
       `🚨 Your DSA ${problemCount === 1 ? "Problem is" : "Problems are"} Calling`, 
       `👀 You Asked Us to Remind You...`, 
       `😏 Remember What You Promised Yourself?`, 
       `👀 Remember ${problemCount === 1 ? "This Problem" : "These Problems"}?`, 
       `🚀 Time to Revisit & Conquer`
    ];

    return subjects;
}
