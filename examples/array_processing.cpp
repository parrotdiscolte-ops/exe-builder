#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // Array processing example
    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90, 5};
    
    std::cout << "Array Processing Demo" << std::endl;
    std::cout << "=====================" << std::endl;
    
    std::cout << "Original array: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    // Sort the array
    std::sort(numbers.begin(), numbers.end());
    
    std::cout << "Sorted array: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    // Find min and max
    auto min_elem = *std::min_element(numbers.begin(), numbers.end());
    auto max_elem = *std::max_element(numbers.begin(), numbers.end());
    
    std::cout << "Minimum: " << min_elem << std::endl;
    std::cout << "Maximum: " << max_elem << std::endl;
    
    // Calculate sum and average
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    double average = static_cast<double>(sum) / numbers.size();
    
    std::cout << "Sum: " << sum << std::endl;
    std::cout << "Average: " << average << std::endl;
    
    return 0;
}