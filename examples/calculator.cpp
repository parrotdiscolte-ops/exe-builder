#include <iostream>
#include <cmath>
#include <iomanip>

int main() {
    double num1 = 25.0;
    double num2 = 7.0;
    
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Calculator Demo" << std::endl;
    std::cout << "===============" << std::endl;
    std::cout << "Number 1: " << num1 << std::endl;
    std::cout << "Number 2: " << num2 << std::endl;
    std::cout << std::endl;
    
    std::cout << "Basic Operations:" << std::endl;
    std::cout << "Addition: " << num1 << " + " << num2 << " = " << (num1 + num2) << std::endl;
    std::cout << "Subtraction: " << num1 << " - " << num2 << " = " << (num1 - num2) << std::endl;
    std::cout << "Multiplication: " << num1 << " * " << num2 << " = " << (num1 * num2) << std::endl;
    std::cout << "Division: " << num1 << " / " << num2 << " = " << (num1 / num2) << std::endl;
    std::cout << std::endl;
    
    std::cout << "Advanced Operations:" << std::endl;
    std::cout << "Square root of " << num1 << " = " << sqrt(num1) << std::endl;
    std::cout << "Power: " << num1 << "^" << num2 << " = " << pow(num1, num2) << std::endl;
    
    return 0;
}