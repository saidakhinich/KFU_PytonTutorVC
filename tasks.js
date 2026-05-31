const Tasks = [
    {
        id: 1,
        title: 'Hello, World!',
        difficulty: 'easy',
        description: 'Напиши программу, которая выводит строку <code>Hello, World!</code> на экран.',
        hint: {
            theory: 'Для вывода текста в Python используется функция <code>print()</code>.',
            code: 'print("Hello, World!")'
        }
    },
    {
        id: 2,
        title: 'Сумма двух чисел',
        difficulty: 'easy',
        description: 'Напиши функцию <code>sum_two(a, b)</code>, которая принимает два числа и возвращает их сумму.',
        hint: {
            theory: 'Функция задаётся через <code>def</code>. Чтобы вернуть значение — используй <code>return</code>.',
            code: 'def sum_two(a, b):\n    return a + b'
        }
    },
    {
        id: 3,
        title: 'Факториал',
        difficulty: 'easy',
        description: 'Напиши функцию <code>factorial(n)</code>, которая возвращает факториал числа n (n!).',
        hint: {
            theory: 'Факториал: n! = 1 * 2 * ... * n. Используй цикл <code>for</code> или рекурсию. Базовый случай: 0! = 1.',
            code: 'def factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result'
        }
    },
    {
        id: 4,
        title: 'Чётное или нечётное',
        difficulty: 'easy',
        description: 'Напиши функцию <code>is_even(n)</code>, которая возвращает <code>True</code>, если число чётное, и <code>False</code> в противном случае.',
        hint: {
            theory: 'Оператор <code>%</code> возвращает остаток от деления. Чётные числа делятся на 2 без остатка: <code>n % 2 == 0</code>.',
            code: 'def is_even(n):\n    return n % 2 == 0'
        }
    },
    {
        id: 5,
        title: 'Максимум из трёх',
        difficulty: 'easy',
        description: 'Напиши функцию <code>max_three(a, b, c)</code>, которая возвращает максимальное из трёх чисел. Не используй встроенную <code>max()</code>.',
        hint: {
            theory: 'Используй операторы сравнения <code>></code> и <code><</code> или вложенные <code>if/else</code>.',
            code: 'def max_three(a, b, c):\n    if a >= b and a >= c:\n        return a\n    elif b >= c:\n        return b\n    else:\n        return c'
        }
    },
    {
        id: 6,
        title: 'Реверс строки',
        difficulty: 'medium',
        description: 'Напиши функцию <code>reverse_str(s)</code>, которая возвращает перевёрнутую строку.',
        hint: {
            theory: 'Срезы в Python: <code>s[::-1]</code> — читает строку задом наперёд. Это самый короткий способ.',
            code: 'def reverse_str(s):\n    return s[::-1]'
        }
    },
    {
        id: 7,
        title: 'Палиндром',
        difficulty: 'medium',
        description: 'Напиши функцию <code>is_palindrome(s)</code>, которая проверяет, является ли строка палиндромом (без учёта регистра и пробелов).',
        hint: {
            theory: 'Сначала убери пробелы (<code>.replace()</code>) и приведи к нижнему регистру (<code>.lower()</code>), затем сравни строку с её реверсом.',
            code: 'def is_palindrome(s):\n    s = s.replace(" ", "").lower()\n    return s == s[::-1]'
        }
    },
    {
        id: 8,
        title: 'FizzBuzz',
        difficulty: 'medium',
        description: 'Напиши функцию <code>fizzbuzz(n)</code>, которая возвращает список чисел от 1 до n. Если число делится на 3 — замени на "Fizz", на 5 — на "Buzz", на оба — на "FizzBuzz".',
        hint: {
            theory: 'Проходи по числам от 1 до n. Проверяй делимость через <code>%</code>. Порядок проверки важен: сначала деление на оба (15), потом на 3 и 5.',
            code: 'def fizzbuzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append("FizzBuzz")\n        elif i % 3 == 0:\n            result.append("Fizz")\n        elif i % 5 == 0:\n            result.append("Buzz")\n        else:\n            result.append(i)\n    return result'
        }
    },
    {
        id: 9,
        title: 'Подсчёт гласных',
        difficulty: 'medium',
        description: 'Напиши функцию <code>count_vowels(s)</code>, которая считает количество гласных букв (а, е, ё, и, о, у, ы, э, ю, я) в строке. Регистр не важен.',
        hint: {
            theory: 'Приведи строку к нижнему регистру и пройдись по символам, проверяя вхождение в строку гласных.',
            code: 'def count_vowels(s):\n    vowels = "аеёиоуыэюя"\n    return sum(1 for c in s.lower() if c in vowels)'
        }
    },
    {
        id: 10,
        title: 'Пузырьковая сортировка',
        difficulty: 'hard',
        description: 'Напиши функцию <code>bubble_sort(lst)</code>, которая сортирует список чисел методом пузырьковой сортировки и возвращает отсортированный список.',
        hint: {
            theory: 'Два вложенных цикла. Внешний — количество проходов. Внутренний — сравнивает соседние элементы и меняет местами, если порядок неверный.',
            code: 'def bubble_sort(lst):\n    arr = lst[:]\n    for i in range(len(arr)):\n        for j in range(len(arr) - 1 - i):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr'
        }
    },
    {
        id: 11,
        title: 'Бинарный поиск',
        difficulty: 'hard',
        description: 'Напиши функцию <code>binary_search(arr, target)</code>, которая выполняет бинарный поиск в отсортированном списке и возвращает индекс элемента или -1, если элемент не найден.',
        hint: {
            theory: 'Два указателя — <code>left</code> и <code>right</code>. На каждом шаге сравниваешь средний элемент с target. Если равен — вернул индекс. Если больше — смещаешь left, если меньше — right.',
            code: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1'
        }
    },
    {
        id: 12,
        title: 'Числа Фибоначчи',
        difficulty: 'medium',
        description: 'Напиши функцию <code>fibonacci(n)</code>, которая возвращает первые n чисел Фибоначчи в виде списка.',
        hint: {
            theory: 'Каждое число — сумма двух предыдущих. Начни с <code>[0, 1]</code> и добавляй новые элементы в цикле.',
            code: 'def fibonacci(n):\n    if n == 0:\n        return []\n    if n == 1:\n        return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib'
        }
    }
];
