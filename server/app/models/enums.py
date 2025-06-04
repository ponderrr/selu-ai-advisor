from enum import Enum

class CourseCategory(str, Enum):
    CORE_CS          = "CORE_CS"
    MATH             = "MATH"
    GENERAL_ED       = "GENERAL_ED"
    ELECTIVE         = "ELECTIVE"
    OTHER            = "OTHER"
    ENGLISH          = "ENGLISH"
    NATURAL_SCIENCE  = "NATURAL_SCIENCE"
    COMPUTER_SCIENCE = "COMPUTER_SCIENCE"

class CourseLevel(str, Enum):
    LEVEL_100 = "100"
    LEVEL_200 = "200"
    LEVEL_300 = "300"
    LEVEL_400 = "400"
    GRADUATE  = "Graduate"
