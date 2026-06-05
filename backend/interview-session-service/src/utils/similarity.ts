import stringSimilarity from "string-similarity"
import { string } from "zod/v4"

export const calculateSimilarity = (expectedAnswer:string, candidateAnswer:string)=>{
    return stringSimilarity.compareTwoStrings(expectedAnswer.toLowerCase().trim(), candidateAnswer.toLowerCase().trim());
}