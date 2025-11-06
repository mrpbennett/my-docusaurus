---
slug: unnest-in-trino
title: Why you need CROSS JOIN with an UNNEST in Trino
tags: [trino, sql]
keywords:
  - SQL
  - trino
  - data engineering
last_updated:
  date: 2025-09-30
---

If you've worked with arrays or delimited strings in Trino, you've probably encountered the need to "explode" them into separate rows. This is where `UNNEST` comes in. But there's a catch: unlike some other SQL databases, Trino requires you to use `CROSS JOIN UNNEST` rather than just `UNNEST` in your `SELECT` clause. Let's explore why.

<!-- truncate -->

## The Problem: Hierarchical Data in a Single Column

Imagine you have data that looks like this:

```
| id | categories                    |
|----|-------------------------------|
| 1  | C10|C10.228|C10.228.140       |
| 2  | E02|E02.642|E02.642.249       |
| 3  | C16|C16.131                   |
```

Each row contains multiple pipe-separated values that you need to work with individually. Maybe you need to join them to another table, count occurrences, or filter by specific codes.

## The Solution: `UNNEST`

`UNNEST` is a table function that takes an array and returns a table with one row for each array element. First, we split our delimited string into an array, then unnest it:

```sql
SELECT t.id, code
FROM my_table t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code);
```

Result:

```
| id | code        |
|----|-------------|
| 1  | C10         |
| 1  | C10.228     |
| 1  | C10.228.140 |
| 2  | E02         |
| 2  | E02.642     |
| 2  | E02.642.249 |
| 3  | C16         |
| 3  | C16.131     |
```

## Why CROSS JOIN?

Here's the key insight: **`UNNEST` is a table function, not a scalar function.**

### What's the Difference?

**Scalar functions** (like `upper()`, `length()`, `split()`):

- Take one or more values as input
- Return a single value as output
- Can be used directly in SELECT clauses

```sql
-- This works fine
SELECT upper(name), length(description)
FROM my_table;
```

**Table functions** (like `UNNEST`):

- Take input (often an array)
- Return a **table** (multiple rows)
- Must be used in the FROM clause

### Why You Can't Do This

```sql
-- ❌ This doesn't work in Trino
SELECT id, unnest(split(categories, '|'))
FROM my_table;
```

Think about what this would mean: for each input row, you're trying to put multiple output rows into a single `SELECT` expression. SQL doesn't know how to handle that because SELECT operates row-by-row.

### The CROSS JOIN Pattern

A `CROSS JOIN` creates a Cartesian product: every row from the left table combined with every row from the right table.

```sql
-- Regular CROSS JOIN
SELECT *
FROM table1
CROSS JOIN table2;
```

When you use `CROSS JOIN UNNEST`, you're doing something clever:

1. For each row in your main table
2. Generate a mini-table from the array using `UNNEST`
3. Join that row with its own mini-table

```sql
SELECT t.id, codes.code
FROM my_table t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code);
```

Here's what happens step by step:

**Row 1:** id=1, categories="C10|C10.228"

- Split creates: `['C10', 'C10.228']`
- UNNEST creates a 2-row table: `{C10}, {C10.228}`
- CROSS JOIN combines: `(1, C10)`, `(1, C10.228)`

**Row 2:** id=2, categories="E02"

- Split creates: `['E02']`
- UNNEST creates a 1-row table: `{E02}`
- CROSS JOIN combines: `(2, E02)`

## Practical Examples

### Example 1: Joining with Another Table

```sql
SELECT
    t.id,
    t.product_name,
    c.category_description
FROM products t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code)
JOIN category_lookup c
    ON codes.code = c.category_code;
```

### Example 2: Filtering for Specific Codes

```sql
SELECT DISTINCT id, product_name
FROM products t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code)
WHERE codes.code LIKE 'C10%';
```

### Example 3: Counting Occurrences

```sql
SELECT codes.code, count(*) as num_products
FROM products t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code)
GROUP BY codes.code
ORDER BY num_products DESC;
```

### Example 4: Working with Multiple Arrays

```sql
SELECT
    t.id,
    tag,
    category
FROM products t
CROSS JOIN UNNEST(split(t.tags, '|')) AS tags(tag)
CROSS JOIN UNNEST(split(t.categories, '|')) AS categories(category);
```

## Common Pitfalls

### Pitfall 1: LIMIT Before vs After UNNEST

```sql
-- This limits AFTER unnesting (might get 20 exploded rows from 2 original rows)
SELECT code
FROM my_table
CROSS JOIN UNNEST(split(categories, '|')) AS codes(code)
LIMIT 20;

-- This limits BEFORE unnesting (gets 20 original rows, then unnests all)
SELECT code
FROM (
    SELECT categories
    FROM my_table
    LIMIT 20
) t
CROSS JOIN UNNEST(split(t.categories, '|')) AS codes(code);
```

### Pitfall 2: Forgetting the Alias

```sql
-- ❌ Missing alias
CROSS JOIN UNNEST(split(categories, '|'))

-- ✅ With alias
CROSS JOIN UNNEST(split(categories, '|')) AS codes(code)
```

### Pitfall 3: NULL or Empty Arrays

If your column contains NULL or produces an empty array, UNNEST will produce zero rows for that input row (the row disappears). Use a LEFT JOIN if you need to preserve rows:

```sql
-- Preserves rows even if array is empty
SELECT t.id, codes.code
FROM my_table t
LEFT JOIN UNNEST(split(t.categories, '|')) AS codes(code) ON true;
```

## Key Takeaways

1. **UNNEST is a table function**, not a scalar function - it produces rows, not values
2. **CROSS JOIN is required** because you're joining each row with its own generated table
3. **The pattern is**: `CROSS JOIN UNNEST(array_expression) AS alias(column_name)`
4. This pattern is powerful for working with hierarchical, delimited, or array data in Trino

Once you understand why the CROSS JOIN is needed, the pattern becomes intuitive. You're not just selecting values - you're joining your data with a dynamically generated table derived from each row's array!

## Further Reading

- [Trino UNNEST Documentation](https://trino.io/docs/current/sql/select.html#unnest)
- [Trino Array Functions](https://trino.io/docs/current/functions/array.html)
- [Understanding SQL Joins](https://trino.io/docs/current/sql/select.html#join-clause)
