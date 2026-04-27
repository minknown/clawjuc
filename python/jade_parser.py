#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jade Parser - Expression parser with AST generation.

Implements a recursive descent parser for simple arithmetic expressions
that builds an abstract syntax tree and evaluates the result.
"""

from __future__ import annotations
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Union


class TokenType(Enum):
    NUMBER = auto()
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    CARET = auto()
    LPAREN = auto()
    RPAREN = auto()
    IDENT = auto()
    EOF = auto()


@dataclass
class Token:
    type: TokenType
    value: str
    position: int


@dataclass
class NumberNode:
    value: float


@dataclass
class BinaryOpNode:
    op: str
    left: Union[NumberNode, BinaryOpNode, UnaryOpNode]
    right: Union[NumberNode, BinaryOpNode, UnaryOpNode]


@dataclass
class UnaryOpNode:
    op: str
    operand: Union[NumberNode, BinaryOpNode, UnaryOpNode]


class Lexer:
    """Tokenizes an input string into a stream of tokens."""

    def __init__(self, text: str):
        self.text = text
        self.pos = 0

    def _advance(self) -> Optional[str]:
        if self.pos < len(self.text):
            ch = self.text[self.pos]
            self.pos += 1
            return ch
        return None

    def _peek(self) -> Optional[str]:
        return self.text[self.pos] if self.pos < len(self.text) else None

    def tokenize(self) -> List[Token]:
        tokens = []
        simple = {
            "+": TokenType.PLUS, "-": TokenType.MINUS,
            "*": TokenType.STAR, "/": TokenType.SLASH,
            "^": TokenType.CARET, "(": TokenType.LPAREN,
            ")": TokenType.RPAREN,
        }
        while self.pos < len(self.text):
            ch = self._peek()
            if ch is None:
                break
            if ch.isspace():
                self._advance()
                continue
            if ch in simple:
                start = self.pos
                self._advance()
                tokens.append(Token(simple[ch], ch, start))
            elif ch.isdigit() or ch == ".":
                start = self.pos
                num_str = ""
                while self._peek() and (self._peek().isdigit() or self._peek() == "."):
                    num_str += self._advance()
                tokens.append(Token(TokenType.NUMBER, num_str, start))
            elif ch.isalpha() or ch == "_":
                start = self.pos
                ident = ""
                while self._peek() and (self._peek().isalnum() or self._peek() == "_"):
                    ident += self._advance()
                tokens.append(Token(TokenType.IDENT, ident, start))
            else:
                self._advance()
        tokens.append(Token(TokenType.EOF, "", self.pos))
        return tokens


class Parser:
    """Recursive descent parser that builds an AST from tokens."""

    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def _current(self) -> Token:
        return self.tokens[self.pos]

    def _consume(self, expected: TokenType) -> Token:
        token = self._current()
        if token.type != expected:
            raise SyntaxError(f"Expected {expected}, got {token.type} at pos {token.position}")
        self.pos += 1
        return token

    def parse(self) -> Union[NumberNode, BinaryOpNode, UnaryOpNode]:
        result = self._expression()
        if self._current().type != TokenType.EOF:
            raise SyntaxError(f"Unexpected token at pos {self._current().position}")
        return result

    def _expression(self):
        return self._additive()

    def _additive(self):
        left = self._multiplicative()
        while self._current().type in (TokenType.PLUS, TokenType.MINUS):
            op_token = self._current()
            self.pos += 1
            right = self._multiplicative()
            left = BinaryOpNode(op_token.value, left, right)
        return left

    def _multiplicative(self):
        left = self._power()
        while self._current().type in (TokenType.STAR, TokenType.SLASH):
            op_token = self._current()
            self.pos += 1
            right = self._power()
            left = BinaryOpNode(op_token.value, left, right)
        return left

    def _power(self):
        base = self._unary()
        if self._current().type == TokenType.CARET:
            self.pos += 1
            exp = self._power()
            return BinaryOpNode("^", base, exp)
        return base

    def _unary(self):
        if self._current().type == TokenType.MINUS:
            self.pos += 1
            operand = self._unary()
            return UnaryOpNode("-", operand)
        return self._primary()

    def _primary(self):
        token = self._current()
        if token.type == TokenType.NUMBER:
            self.pos += 1
            return NumberNode(float(token.value))
        if token.type == TokenType.LPAREN:
            self._consume(TokenType.LPAREN)
            expr = self._expression()
            self._consume(TokenType.RPAREN)
            return expr
        raise SyntaxError(f"Unexpected token '{token.value}' at pos {token.position}")


def evaluate(node: Union[NumberNode, BinaryOpNode, UnaryOpNode]) -> float:
    """Recursively evaluate an AST node."""
    if isinstance(node, NumberNode):
        return node.value
    if isinstance(node, UnaryOpNode):
        val = evaluate(node.operand)
        return -val if node.op == "-" else val
    if isinstance(node, BinaryOpNode):
        left = evaluate(node.left)
        right = evaluate(node.right)
        if node.op == "+":
            return left + right
        if node.op == "-":
            return left - right
        if node.op == "*":
            return left * right
        if node.op == "/":
            return left / right if right != 0 else float("inf")
        if node.op == "^":
            return left ** right
    return 0.0


if __name__ == "__main__":
    expression = "3 + 4 * 2 ^ (1 - 5) / -2"
    lexer = Lexer(expression)
    tokens = lexer.tokenize()
    print(f"Tokens: {[(t.type.name, t.value) for t in tokens]}")
    parser = Parser(tokens)
    ast = parser.parse()
    result = evaluate(ast)
    print(f"Expression: {expression}")
    print(f"Result: {result:.4f}")
